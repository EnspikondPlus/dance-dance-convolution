export default function Header() {
  return (
    <header>
      <div className="header-left">
        <img src="src/assets/logo.png" alt="Logo" />
        <h1>Dance Dance Convolution</h1>
      </div>

      <nav className="header-right">
        <a href="#section1">DDConvolution</a>
        <a href="#section2">Grab A Track</a>
        <a href="#section3">Dance!</a>
      </nav>
    </header>
  );
}