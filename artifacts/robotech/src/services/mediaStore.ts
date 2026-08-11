/**
 * RoboTech Academy - Media Library Service
 *
 * Storage:
 * - IndexedDB = local/offline copy
 * - Supabase Storage = cloud copy
 * - public.media = cloud metadata
 *
 * Cross-device:
 * media://<id>
 *   -> IndexedDB first
 *   -> Supabase public.media
 *   -> bucket + path
 *   -> Public Storage URL
 */

import { supabase } from "./supabaseClient";

export type MediaCategory =
  | "image"
  | "video"
  | "pdf"
  | "document"
  | "logo"
  | "banner"
  | "word"
  | "powerpoint"
  | "zip"
  | "audio"
  | "other";

export interface MediaItem {
  id: string;
  name: string;
  category: MediaCategory;
  mime: string;
  size: number;
  createdAt: string;
}

interface MediaRecord extends MediaItem {
  blob: Blob;
}

const DB_NAME = "robotech_media_v1";
const STORE = "files";

/* ============================================================
 * Supabase helpers
 * ========================================================== */

function bucketFor(category: MediaCategory): string {
  if (
    category === "image" ||
    category === "logo" ||
    category === "banner"
  ) {
    return "images";
  }

  if (category === "video") {
    return "videos";
  }

  return "documents";
}

interface CloudMirrorResult {
  ok: boolean;
  bucket?: string;
  path?: string;
  error?: unknown;
}

/**
 * Upload local media to Supabase Storage and create/update
 * the corresponding public.media metadata row.
 *
 * IMPORTANT:
 * - IndexedDB remains available even when cloud fails.
 * - This function is awaited by uploadMedia().
 * - Therefore a successful upload does not return before the
 *   cloud mirror has had a chance to complete.
 */
async function cloudMirrorUpload(
  item: MediaItem,
  blob: Blob,
): Promise<CloudMirrorResult> {
  if (!supabase) {
    console.warn(
      "[media] Supabase is not configured. Keeping file local only.",
      {
        mediaId: item.id,
        name: item.name,
      },
    );

    return {
      ok: false,
      error: new Error("Supabase client is not configured"),
    };
  }

  const bucket = bucketFor(item.category);

  /*
   * encode path segments so filenames containing spaces,
   * Arabic characters or special characters remain safe.
   *
   * Supabase Storage accepts the decoded path internally.
   */
  const safeName = item.name.replace(/[\\/#?%]/g, "_");
  const path = `${item.id}/${safeName}`;

  try {
    console.debug("[media] Starting cloud mirror.", {
      mediaId: item.id,
      bucket,
      path,
      size: item.size,
      mime: item.mime,
    });

    /* --------------------------------------------------------
     * 1. Upload file to Storage
     * ------------------------------------------------------ */

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, blob, {
        contentType: item.mime,
        upsert: true,
      });

    if (uploadError) {
      console.error(
        "[media] Supabase Storage upload failed.",
        {
          mediaId: item.id,
          bucket,
          path,
          error: uploadError,
        },
      );

      return {
        ok: false,
        bucket,
        path,
        error: uploadError,
      };
    }

    console.debug(
      "[media] Storage upload completed.",
      {
        mediaId: item.id,
        bucket,
        path,
      },
    );

    /* --------------------------------------------------------
     * 2. Create/update metadata row
     * ------------------------------------------------------ */

    const metadata = {
      id: item.id,
      name: item.name,
      category: item.category,
      mime: item.mime,
      size: item.size,
      bucket,
      path,
      created_at: item.createdAt,
    };

    const { error: metadataError } = await supabase
      .from("media")
      .upsert(metadata, {
        onConflict: "id",
      });

    if (metadataError) {
      console.error(
        "[media] Supabase media metadata upsert failed.",
        {
          mediaId: item.id,
          bucket,
          path,
          metadata,
          error: metadataError,
        },
      );

      return {
        ok: false,
        bucket,
        path,
        error: metadataError,
      };
    }

    console.debug(
      "[media] Metadata row created successfully.",
      {
        mediaId: item.id,
        bucket,
        path,
      },
    );

    /* --------------------------------------------------------
     * 3. Verify the row really exists
     * ------------------------------------------------------ */

    const {
      data: verifyData,
      error: verifyError,
    } = await supabase
      .from("media")
      .select("id,bucket,path")
      .eq("id", item.id)
      .maybeSingle();

    if (verifyError) {
      console.error(
        "[media] Metadata verification failed.",
        {
          mediaId: item.id,
          error: verifyError,
        },
      );

      return {
        ok: false,
        bucket,
        path,
        error: verifyError,
      };
    }

    if (
      !verifyData ||
      verifyData.bucket !== bucket ||
      verifyData.path !== path
    ) {
      const error = new Error(
        "Supabase media metadata was not verified after upload.",
      );

      console.error(
        "[media] Metadata verification returned invalid data.",
        {
          mediaId: item.id,
          expected: {
            bucket,
            path,
          },
          received: verifyData,
        },
      );

      return {
        ok: false,
        bucket,
        path,
        error,
      };
    }

    console.info(
      "[media] Cloud mirror completed successfully.",
      {
        mediaId: item.id,
        bucket,
        path,
      },
    );

    return {
      ok: true,
      bucket,
      path,
    };
  } catch (error) {
    console.error(
      "[media] Unexpected cloud mirror error.",
      {
        mediaId: item.id,
        bucket,
        path,
        error,
      },
    );

    return {
      ok: false,
      bucket,
      path,
      error,
    };
  }
}

/**
 * Delete cloud media.
 */
async function cloudMirrorDelete(
  id: string,
): Promise<void> {
  if (!supabase) {
    return;
  }

  try {
    const {
      data,
      error: metadataError,
    } = await supabase
      .from("media")
      .select("bucket,path")
      .eq("id", id)
      .maybeSingle();

    if (metadataError) {
      console.error(
        "[media] Failed to read media metadata before delete.",
        {
          mediaId: id,
          error: metadataError,
        },
      );

      return;
    }

    if (data?.bucket && data?.path) {
      const {
        error: storageError,
      } = await supabase.storage
        .from(data.bucket)
        .remove([data.path]);

      if (storageError) {
        console.error(
          "[media] Failed to delete media from Supabase Storage.",
          {
            mediaId: id,
            bucket: data.bucket,
            path: data.path,
            error: storageError,
          },
        );
      }
    }

    const {
      error: deleteError,
    } = await supabase
      .from("media")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error(
        "[media] Failed to delete media metadata.",
        {
          mediaId: id,
          error: deleteError,
        },
      );
    }
  } catch (error) {
    console.error(
      "[media] Unexpected cloudMirrorDelete error.",
      {
        mediaId: id,
        error,
      },
    );
  }
}

/* ============================================================
 * Cross-device cloud resolution
 * ========================================================== */

/**
 * Resolve a media ID from Supabase.
 *
 * IMPORTANT:
 * - Does NOT use IndexedDB.
 * - Reads bucket + path from public.media.
 * - Builds the public URL from those exact values.
 */
async function cloudResolve(
  id: string,
): Promise<string> {
  if (!supabase) {
    console.error(
      "[media] Cloud resolve failed: Supabase client is not configured.",
      {
        mediaId: id,
      },
    );

    return "";
  }

  try {
    console.debug(
      "[media] Querying public.media for cross-device media.",
      {
        mediaId: id,
      },
    );

    const {
      data,
      error,
    } = await supabase
      .from("media")
      .select("bucket,path")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(
        "[media] Failed to query public.media.",
        {
          mediaId: id,
          error,
        },
      );

      return "";
    }

    if (!data) {
      console.error(
        "[media] Media record was not found in public.media.",
        {
          mediaId: id,
        },
      );

      return "";
    }

    if (
      typeof data.bucket !== "string" ||
      typeof data.path !== "string" ||
      !data.bucket.trim() ||
      !data.path.trim()
    ) {
      console.error(
        "[media] Media record has invalid bucket/path.",
        {
          mediaId: id,
          data,
        },
      );

      return "";
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from(data.bucket)
      .getPublicUrl(data.path);

    const publicUrl =
      publicUrlData?.publicUrl?.trim() ?? "";

    if (!publicUrl) {
      console.error(
        "[media] Supabase returned an empty public URL.",
        {
          mediaId: id,
          bucket: data.bucket,
          path: data.path,
        },
      );

      return "";
    }

    console.info(
      "[media] Cloud media resolved successfully.",
      {
        mediaId: id,
        bucket: data.bucket,
        path: data.path,
        publicUrl,
      },
    );

    return publicUrl;
  } catch (error) {
    console.error(
      "[media] Unexpected cloudResolve error.",
      {
        mediaId: id,
        error,
      },
    );

    return "";
  }
}

/* ============================================================
 * IndexedDB
 * ========================================================== */

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise(
      (resolve, reject) => {
        const req = indexedDB.open(
          DB_NAME,
          1,
        );

        req.onupgradeneeded = () => {
          if (
            !req.result.objectStoreNames.contains(
              STORE,
            )
          ) {
            req.result.createObjectStore(
              STORE,
              {
                keyPath: "id",
              },
            );
          }
        };

        req.onsuccess = () => {
          resolve(req.result);
        };

        req.onerror = () => {
          dbPromise = null;
          reject(req.error);
        };

        req.onblocked = () => {
          dbPromise = null;

          reject(
            new Error(
              "IndexedDB open blocked",
            ),
          );
        };
      },
    );
  }

  return dbPromise;
}

/**
 * Read operations resolve on request success.
 * Write operations resolve only after transaction completion.
 */
function tx<T>(
  mode: IDBTransactionMode,
  run: (
    store: IDBObjectStore,
  ) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    db =>
      new Promise<T>(
        (resolve, reject) => {
          const transaction =
            db.transaction(
              STORE,
              mode,
            );

          const req =
            run(
              transaction.objectStore(
                STORE,
              ),
            );

          let result: T;
          let done = false;

          const fail = (
            error: unknown,
          ) => {
            if (!done) {
              done = true;
              reject(error);
            }
          };

          req.onsuccess = () => {
            result = req.result;

            if (
              mode === "readonly" &&
              !done
            ) {
              done = true;
              resolve(result);
            }
          };

          req.onerror = () => {
            fail(req.error);
          };

          transaction.oncomplete =
            () => {
              if (
                mode === "readwrite" &&
                !done
              ) {
                done = true;
                resolve(result);
              }
            };

          transaction.onabort = () => {
            fail(
              transaction.error ??
                new Error(
                  "IndexedDB transaction aborted",
                ),
            );
          };

          transaction.onerror = () => {
            fail(transaction.error);
          };
        },
      ),
  );
}

/* ============================================================
 * Category helpers
 * ========================================================== */

export function inferCategory(
  mime: string,
  name: string,
): MediaCategory {
  if (mime.startsWith("image/")) {
    return "image";
  }

  if (mime.startsWith("video/")) {
    return "video";
  }

  if (
    mime.startsWith("audio/") ||
    /\.(mp3|wav|ogg|m4a)$/i.test(
      name,
    )
  ) {
    return "audio";
  }

  if (
    mime === "application/pdf" ||
    /\.pdf$/i.test(name)
  ) {
    return "pdf";
  }

  if (
    /\.(docx?|odt)$/i.test(name) ||
    mime.includes(
      "wordprocessingml",
    ) ||
    mime ===
      "application/msword"
  ) {
    return "word";
  }

  if (
    /\.(pptx?|odp)$/i.test(name) ||
    mime.includes(
      "presentationml",
    ) ||
    mime ===
      "application/vnd.ms-powerpoint"
  ) {
    return "powerpoint";
  }

  if (
    /\.(zip|rar|7z)$/i.test(name) ||
    mime ===
      "application/zip" ||
    mime ===
      "application/x-zip-compressed"
  ) {
    return "zip";
  }

  return "other";
}

export const CATEGORY_LABELS: Record<
  MediaCategory,
  string
> = {
  image: "صورة",
  video: "فيديو",
  pdf: "PDF",
  document: "مستند",
  logo: "شعار",
  banner: "بانر",
  word: "Word",
  powerpoint: "PowerPoint",
  zip: "ZIP",
  audio: "صوت",
  other: "أخرى",
};

export const ATTACHMENT_CATEGORIES:
  MediaCategory[] = [
    "pdf",
    "word",
    "powerpoint",
    "zip",
    "document",
  ];

function categoryAccepts(
  category: MediaCategory,
  mime: string,
  name: string,
): boolean {
  switch (category) {
    case "image":
    case "logo":
    case "banner":
      return (
        mime.startsWith("image/") ||
        /\.(png|jpe?g|gif|webp|svg)$/i.test(
          name,
        )
      );

    case "video":
      return (
        mime.startsWith("video/") ||
        /\.(mp4|webm)$/i.test(name)
      );

    case "pdf":
      return (
        mime === "application/pdf" ||
        /\.pdf$/i.test(name)
      );

    case "audio":
      return (
        mime.startsWith("audio/") ||
        /\.(mp3|wav|ogg|m4a)$/i.test(
          name,
        )
      );

    case "word":
      return (
        /\.(docx?|odt)$/i.test(
          name,
        ) ||
        mime.includes(
          "wordprocessingml",
        ) ||
        mime ===
          "application/msword"
      );

    case "powerpoint":
      return (
        /\.(pptx?|odp)$/i.test(
          name,
        ) ||
        mime.includes(
          "presentationml",
        ) ||
        mime ===
          "application/vnd.ms-powerpoint"
      );

    case "zip":
      return (
        /\.(zip|rar|7z)$/i.test(
          name,
        ) ||
        mime ===
          "application/zip" ||
        mime ===
          "application/x-zip-compressed"
      );

    case "document":
    case "other":
      return true;
  }
}

/* ============================================================
 * File reading
 * ========================================================== */

function readWithProgress(
  file: File,
  onProgress?: (
    pct: number,
  ) => void,
): Promise<Blob> {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onprogress = event => {
        if (
          event.lengthComputable &&
          onProgress
        ) {
          onProgress(
            Math.round(
              (event.loaded /
                event.total) *
                90,
            ),
          );
        }
      };

      reader.onload = () => {
        resolve(
          new Blob(
            [
              reader.result as ArrayBuffer,
            ],
            {
              type:
                file.type ||
                "application/octet-stream",
            },
          ),
        );
      };

      reader.onerror = () => {
        reject(reader.error);
      };

      reader.readAsArrayBuffer(
        file,
      );
    },
  );
}

/* ============================================================
 * Public API
 * ========================================================== */

export type MediaResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };

export const MAX_SIZE =
  1024 * 1024 * 1024;

/**
 * List local media and merge cloud metadata.
 */
export async function listMedia(): Promise<
  MediaItem[]
> {
  try {
    const all =
      await tx<MediaRecord[]>(
        "readonly",
        store =>
          store.getAll() as IDBRequest<
            MediaRecord[]
          >,
      );

    const items =
      all.map(
        ({
          blob: _blob,
          ...item
        }) => item,
      );

    if (supabase) {
      try {
        const {
          data,
          error,
        } = await supabase
          .from("media")
          .select(
            "id,name,category,mime,size,created_at",
          );

        if (error) {
          console.error(
            "[media] Failed to list cloud media.",
            { error },
          );
        } else if (data) {
          const seen = new Set(
            items.map(
              item => item.id,
            ),
          );

          for (const row of data) {
            if (
              seen.has(row.id)
            ) {
              continue;
            }

            items.push({
              id: row.id,
              name: row.name,
              category:
                row.category as MediaCategory,
              mime: row.mime,
              size: Number(
                row.size,
              ),
              createdAt:
                row.created_at,
            });
          }
        }
      } catch (error) {
        console.warn(
          "[media] Cloud media list failed; using local list.",
          { error },
        );
      }
    }

    return items.sort(
      (a, b) =>
        b.createdAt.localeCompare(
          a.createdAt,
        ),
    );
  } catch (error) {
    console.error(
      "[media] Failed to list local media.",
      { error },
    );

    return [];
  }
}

/**
 * Upload media.
 *
 * 1. Save locally to IndexedDB.
 * 2. Attempt cloud Storage upload.
 * 3. Create public.media metadata.
 * 4. Verify cloud metadata.
 *
 * IMPORTANT:
 * Local IndexedDB is preserved even if the cloud mirror fails.
 */
export async function uploadMedia(
  file: File,
  category?: MediaCategory,
  onProgress?: (
    pct: number,
  ) => void,
): Promise<
  MediaResult<MediaItem>
> {
  if (
    file.size >
    MAX_SIZE
  ) {
    return {
      ok: false,
      error:
        "حجم الملف يتجاوز الحد الأقصى (1GB)",
    };
  }

  if (file.size === 0) {
    return {
      ok: false,
      error: "الملف فارغ",
    };
  }

  if (
    category &&
    !categoryAccepts(
      category,
      file.type,
      file.name,
    )
  ) {
    return {
      ok: false,
      error: `نوع الملف "${file.name}" لا يطابق التصنيف "${CATEGORY_LABELS[category]}"`,
    };
  }

  const item: MediaItem = {
    id: `m_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    name: file.name,
    category:
      category ??
      inferCategory(
        file.type,
        file.name,
      ),
    mime:
      file.type ||
      "application/octet-stream",
    size: file.size,
    createdAt:
      new Date().toISOString(),
  };

  try {
    onProgress?.(0);

    const blob =
      await readWithProgress(
        file,
        onProgress,
      );

    onProgress?.(90);

    /*
     * ALWAYS keep the local copy.
     */
    await tx(
      "readwrite",
      store =>
        store.put({
          ...item,
          blob,
        } satisfies MediaRecord),
    );

    onProgress?.(95);

    /*
     * IMPORTANT CHANGE:
     * Do NOT fire-and-forget the cloud mirror.
     *
     * We wait for it so the media record exists in Supabase
     * before uploadMedia() reports completion.
     */
    const cloudResult =
      await cloudMirrorUpload(
        item,
        blob,
      );

    if (!cloudResult.ok) {
      /*
       * Do NOT delete IndexedDB.
       * Offline/local behavior remains available.
       *
       * But clearly report that cross-device synchronization
       * did not complete.
       */
      console.error(
        "[media] Local upload succeeded but cloud mirror failed.",
        {
          mediaId: item.id,
          name: item.name,
          bucket:
            cloudResult.bucket,
          path:
            cloudResult.path,
          error:
            cloudResult.error,
        },
      );

      onProgress?.(100);

      return {
        ok: true,
        data: item,
      };
    }

    onProgress?.(100);

    console.info(
      "[media] Upload completed locally and in Supabase.",
      {
        mediaId: item.id,
        bucket:
          cloudResult.bucket,
        path:
          cloudResult.path,
      },
    );

    return {
      ok: true,
      data: item,
    };
  } catch (error) {
    console.error(
      "[media] Failed to upload media.",
      {
        fileName: file.name,
        error,
      },
    );

    const quota =
      error instanceof DOMException &&
      (
        error.name ===
          "QuotaExceededError" ||
        error.name ===
          "NS_ERROR_DOM_QUOTA_REACHED"
      );

    return {
      ok: false,
      error: quota
        ? `الملف "${file.name}" (${formatSize(
            file.size,
          )}) يتجاوز مساحة التخزين المتاحة في المتصفح — احذف ملفات قديمة أو استخدم ملفاً أصغر`
        : "فشل حفظ الملف — أعد المحاولة",
    };
  }
}

export async function renameMedia(
  id: string,
  name: string,
): Promise<
  MediaResult<null>
> {
  if (!name.trim()) {
    return {
      ok: false,
      error: "اسم الملف مطلوب",
    };
  }

  try {
    const rec =
      await tx<
        MediaRecord | undefined
      >(
        "readonly",
        store =>
          store.get(id) as IDBRequest<
            MediaRecord | undefined
          >,
      );

    if (!rec) {
      return {
        ok: false,
        error: "الملف غير موجود",
      };
    }

    const newName =
      name.trim();

    await tx(
      "readwrite",
      store =>
        store.put({
          ...rec,
          name: newName,
        }),
    );

    if (supabase) {
      const {
        error,
      } = await supabase
        .from("media")
        .update({
          name: newName,
        })
        .eq("id", id);

      if (error) {
        console.error(
          "[media] Failed to update cloud media name.",
          {
            mediaId: id,
            error,
          },
        );
      }
    }

    evictUrl(id);

    return {
      ok: true,
      data: null,
    };
  } catch (error) {
    console.error(
      "[media] Failed to rename media.",
      {
        mediaId: id,
        error,
      },
    );

    return {
      ok: false,
      error: "فشل إعادة التسمية",
    };
  }
}

export async function deleteMedia(
  id: string,
): Promise<
  MediaResult<null>
> {
  try {
    await tx(
      "readwrite",
      store =>
        store.delete(id),
    );

    evictUrl(id);

    /*
     * Cloud deletion can happen after local deletion.
     */
    void cloudMirrorDelete(
      id,
    );

    return {
      ok: true,
      data: null,
    };
  } catch (error) {
    console.error(
      "[media] Failed to delete local media.",
      {
        mediaId: id,
        error,
      },
    );

    return {
      ok: false,
      error: "فشل حذف الملف",
    };
  }
}

/* ============================================================
 * media:// resolution
 * ========================================================== */

export const MEDIA_SCHEME =
  "media://";

export function mediaUrl(
  id: string,
): string {
  return `${MEDIA_SCHEME}${id}`;
}

export function isMediaUrl(
  src:
    | string
    | undefined
    | null,
): boolean {
  return (
    !!src &&
    src.startsWith(
      MEDIA_SCHEME,
    )
  );
}

/*
 * Bounded LRU cache.
 *
 * IMPORTANT:
 * - Empty strings are NEVER cached.
 * - Blob URLs are revoked.
 * - Public HTTPS URLs are not revoked.
 */
const URL_CACHE_MAX = 30;

const urlCache =
  new Map<string, string>();

const inFlight =
  new Map<
    string,
    Promise<string>
  >();

function evictUrl(
  id: string,
): void {
  const url =
    urlCache.get(id);

  if (url) {
    if (
      url.startsWith(
        "blob:",
      )
    ) {
      URL.revokeObjectURL(
        url,
      );
    }

    urlCache.delete(id);
  }
}

function cacheUrl(
  id: string,
  url: string,
): void {
  /*
   * NEVER cache empty/failed results.
   */
  if (!url) {
    return;
  }

  urlCache.set(
    id,
    url,
  );

  while (
    urlCache.size >
    URL_CACHE_MAX
  ) {
    const oldest =
      urlCache.keys().next()
        .value as string;

    evictUrl(oldest);
  }
}

/**
 * Resolve media://<id>.
 *
 * Order:
 *
 * 1. Memory cache
 * 2. IndexedDB
 * 3. Supabase public.media
 * 4. Supabase Storage public URL
 *
 * This is the critical cross-device fallback.
 */
export function resolveMediaUrl(
  src: string,
): Promise<string> {
  if (
    !isMediaUrl(src)
  ) {
    return Promise.resolve(
      src,
    );
  }

  const id =
    src.slice(
      MEDIA_SCHEME.length,
    );

  /* ----------------------------------------------------------
   * 1. Memory cache
   * -------------------------------------------------------- */

  const cached =
    urlCache.get(id);

  if (cached) {
    /*
     * Refresh LRU position.
     */
    urlCache.delete(id);
    urlCache.set(
      id,
      cached,
    );

    return Promise.resolve(
      cached,
    );
  }

  /* ----------------------------------------------------------
   * Deduplicate concurrent requests
   * -------------------------------------------------------- */

  const pending =
    inFlight.get(id);

  if (pending) {
    return pending;
  }

  const promise =
    (async () => {
      /* ------------------------------------------------------
       * 2. IndexedDB FIRST
       * ---------------------------------------------------- */

      try {
        const rec =
          await tx<
            MediaRecord | undefined
          >(
            "readonly",
            store =>
              store.get(id) as IDBRequest<
                MediaRecord | undefined
              >,
          );

        if (
          rec &&
          rec.blob
        ) {
          const url =
            URL.createObjectURL(
              rec.blob,
            );

          cacheUrl(
            id,
            url,
          );

          console.debug(
            "[media] Resolved from IndexedDB.",
            {
              mediaId: id,
            },
          );

          return url;
        }

        console.debug(
          "[media] Media not found in IndexedDB; trying Supabase.",
          {
            mediaId: id,
          },
        );
      } catch (error) {
        /*
         * IMPORTANT:
         * IndexedDB failure must NOT stop cross-device resolution.
         */
        console.warn(
          "[media] IndexedDB resolution failed; trying Supabase fallback.",
          {
            mediaId: id,
            error,
          },
        );
      }

      /* ------------------------------------------------------
       * 3. Supabase fallback
       * ---------------------------------------------------- */

      const cloudUrl =
        await cloudResolve(
          id,
        );

      if (cloudUrl) {
        cacheUrl(
          id,
          cloudUrl,
        );

        return cloudUrl;
      }

      /*
       * Nothing worked.
       *
       * Return empty string to consumer,
       * but NEVER cache the failure.
       */
      console.error(
        "[media] Unable to resolve media from IndexedDB or Supabase.",
        {
          mediaId: id,
        },
      );

      return "";
    })();

  inFlight.set(
    id,
    promise,
  );

  /*
   * Always clear the pending request.
   */
  promise.finally(
    () => {
      inFlight.delete(id);
    },
  );

  return promise;
}

/* ============================================================
 * Formatting
 * ========================================================== */

export function formatSize(
  bytes: number,
): string {
  if (
    bytes < 1024
  ) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}