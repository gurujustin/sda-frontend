import { SvgIcon, Link } from "@material-ui/core";

export default function Social() {
  return (
    <div className="social-row">
      {/* <Link href="https://github.com/Gla-DAO" target="_blank">
        <SvgIcon color="primary" component={GitHub} />
      </Link> */}

      <Link href="https://t.me/GalacticDAO" target="_blank">
        <img src="/facebook.png" style={{"width":"30px","height":"30px"}} />
      </Link>

      <Link href="https://www.reddit.com/r/Galactic_DAO/" target="_blank">
        <img src="/linkedin.png" style={{"width":"30px","height":"30px"}} />
      </Link>

      <Link href="https://twitter.com/galactic_dao" target="_blank">
        <img src="/youtube.png" style={{"width":"30px","height":"30px"}} />
      </Link>

      {/* <Link href="s://discord.gg/94aP9kRP87" target="_blank">
        <SvgIcon color="primary" component={Discord} />
      </Link> */}
    </div>
  );
}
