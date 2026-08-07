import type { AdminModule } from "./modules";

/** Placeholder screen for modules arriving in Phase 2B. */
export default function ModulePlaceholder({ module }: { module: AdminModule }) {
  return (
    <div className="admin-placeholder">
      <div className="admin-placeholder-icon">
        <i className={`fas ${module.icon}`} />
      </div>
      <h2>{module.title}</h2>
      <p>{module.desc}</p>
      <span className="admin-phase-chip">
        <i className="fas fa-hourglass-half" /> قادم في المرحلة 2B
      </span>
    </div>
  );
}
