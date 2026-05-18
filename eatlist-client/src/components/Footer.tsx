import { FunctionComponent } from "react";
import "../style/footer.css"

interface FooterProps {
    
}
 
const Footer: FunctionComponent<FooterProps> = () => {
    return (<>
    <div className="footer-container z-index-front" lang="en">
        <div className="main-flex-container">
            <img src="/logo_lg_black.png" alt="eatlist logo" className="eatlist-logo-small footer-logo"/>
            <div className="small-flex-container">
                <p className="text-header">Copyright © 2026 Eatlist .Ltd <span className="secondary-text">(by Amit Krivine)</span></p>
                <p className="text-body"><span style={{fontWeight:600}}>Email:</span> eatlist@atomicmail.io</p>
                <p className="text-body"><span style={{fontWeight:600}}>Phone:</span> 054-6314202</p>
            </div>
        </div>
    </div>
    </>);
}
 
export default Footer;