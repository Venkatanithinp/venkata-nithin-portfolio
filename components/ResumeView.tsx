export default function ResumeView() {
  const resumeUrl = '/Venkata-Nithin-Resume.pdf';

  return (
    <main className="document-page">
      <nav className="document-nav">
        <a className="footer-logo" href="/">VN.</a>
        <a href="/">← Back to portfolio</a>
      </nav>
      <div className="section-top">
        <span className="mono">THE COMPLETE PICTURE</span>
        <span className="mono">RESUME / PDF</span>
      </div>
      <div className="section-heading">
        <h1>MY <em>RESUME.</em></h1>
        <a className="solid-button" href={resumeUrl} download="Venkata-Nithin-Resume.pdf">
          Download PDF ↓
        </a>
      </div>
      <iframe className="resume-frame" src={resumeUrl} title="Venkata Nithin resume PDF" />
      <p className="small-note">
        If your browser cannot display the PDF, use the download button above.
      </p>
      <footer className="document-footer"><a href="/">← Portfolio</a></footer>
    </main>
  );
}
