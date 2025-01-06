const Footer = () => {
  return (
    <footer className="bg-dark p-8">
      <p className="text-sm">
        Designé par{" "}
        <a
          className="underline hover:text-primary duration-100"
          href="https://cecile-lochus.fr/"
          target="_blank"
          rel="noopener"
        >
          Cécile Lochus
        </a>{" "}
        et développé par{" "}
        <a
          className="underline hover:text-primary duration-100"
          href="https://antoinefavereau.fr/"
          target="_blank"
          rel="noopener"
        >
          Antoine Favereau
        </a>
      </p>
    </footer>
  );
};

export default Footer;
