function SectionCard({ title, action, children }) {
  return (
    <div className="section-card">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h5 className="section-title mb-0">
          {title}
        </h5>

        {action && (
          <div>
            {action}
          </div>
        )}

      </div>

      {children}

    </div>
  );
}

export default SectionCard;