import { FunctionComponent } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "../style/global-assets.css"
import Footer from "./Footer";

interface AboutProps {
    
}
 
const About: FunctionComponent<AboutProps> = () => {
    return (<>
        <Navbar/>
        <Sidebar/>
        <main className="container" lang="he">
            <div className="page-content">
                <img src="https://cdn.dribbble.com/userupload/31776407/file/original-9912ad5f5772dc1e836e97350967fa3f.jpg" alt="eatlist" className="image-overlay"/>
                <div className="container-content z-index-front">
                    <div>
                        <h2 className="section-header-text extra-spacing centered">אז מה זה <span lang="en" style={{fontWeight:600}}>Eatlist?</span></h2>
                        <p>
                            יש לך מסעדה בה ביקרת ומאז חזרת אליה שוב ושוב?
                            <br />
                            אחת שגילית לאחרונה וכבר שכחת את שמה?
                            <br />
                            ועוד עשרים שרצית לנסות ועדיין לא הגעת?
                            <br /> <br />
                            Eatlist היא המקום שבו כל זה מתארגן - רשימות מסעדות בבנייה אישית, שניתן לסדר, להוסיף הערות, ולעקוב אחרי רשימות של אחרים.
                            <br />
                            לא עוד ריל באינסטגרם שנקבר בתוך ה-saved.
                            <br />
                            לא עוד הודעה שנעלמת בהיסטוריית הוואטסאפ.
                            <br /> <br />
                            כאן אפשר לנהל רשימה, או כמה רשימות אם צריך, נקיות ומסודרות. שלך.
                        </p>
                    </div>
                    <div>
                        <h2 className="section-header-text extra-spacing centered">איך משתמשים?</h2>
                        <p>
                            פשוט מאוד -
                            <br />
                            קודם כל יוצרים חשבון באתר.
                            <br /> <br />
                            יוצרים Eatlist בתפריט הצד - אפשר לתת לה שם, תיאור, תמונה אם רוצים - ומתחילים להוסיף מסעדות.
                            <br />
                            אפשר לסדר את המסעדות לפי סדר עדיפויות, להוסיף הערה אישית לכל מסעדה ברשימה, ולהחליט אם הרשימה תהיה פרטית רק לך או פומבית לכולם.
                            <br /> <br />
                            מצאת Eatlist של מישהו אחר שאהבת? אפשר לעקוב אחריה והיא תישמר אצלך בספרייה
                            <br />
                            מצאת מסעדה שאהבת במיוחד? אפשר ללחוץ על אייקון הלב ולשמור אותן תחת "מסעדות שאהבתי".
                            <br /> <br />
                            זהו, ככה פשוט. תתחילו לאכול!
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    </>);
}
 
export default About;