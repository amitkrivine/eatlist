import { FunctionComponent } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Swal from "sweetalert2";
import { login } from "../services/UserService";
import { useFormik } from "formik";
import "../style/register.css";
import "../style/global-assets.css";
import Footer from "./Footer";

interface LoginProps {
    
}
 
const Login: FunctionComponent<LoginProps> = () => {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {email: "", password: ""},
        validationSchema: yup.object({
            email: yup.string().required("מייל הוא שדה חובה").email("תוכן השדה אינו כתובת מייל").min(5, "מייל חייב לכלול לפחות 5 תווים"),
            password: yup.string().required("סיסמה היא שדה חובה").matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9].*[0-9].*[0-9].*[0-9])(?=.*[!@#$%^&*_-]).{8,}$/, "על הסיסמה לכלול לפחות 8 תווים, ביניהם אות גדולה, אות קטנה, לפחות 4 ספרות, וסימן מיוחד")
        }),
        onSubmit: async values => {
            try{
                const response = await login({email: values.email, password: values.password });
                localStorage.setItem("token", response.data);
                navigate("/");
                Swal.fire({
                    title: "ברוכים הבאים",
                    text: "גלישה נעימה",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                })
            }
            catch(error){
                console.log("Login failed - ", error);
                Swal.fire({
                    title: "...אופס",
                    text: "התחברות נכשלה. בדקו את פרטי ההתחברות ונסו שוב",
                    icon: "error",
                    confirmButtonText: "חזרה"
                })
            }
        }
    });
    return (<>
        <Navbar/>
        <Sidebar/>
        <div className="container justify-spacebt" lang="he">
            <div className="page-content">
                <img src="https://cdn.dribbble.com/userupload/31776407/file/original-9912ad5f5772dc1e836e97350967fa3f.jpg" alt="eatlist" className="image-overlay"/>
                <div className="profile-container z-index-front">
                    <h2 className="section-header-text extra-spacing centered">כניסה לחשבון</h2>
                    <form onSubmit={formik.handleSubmit} className="form">
                        <div className="login-form-section">
                            <div className="form-control">
                                <input type="text" id="email" name="email" placeholder=" " value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="email">מייל*</label>
                                {formik.touched.email && formik.errors.email && (
                                    <p>{formik.errors.email}</p>
                                )}
                            </div>
                            <div className="form-control">
                                <input type="password" id="password" name="password" placeholder=" " value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="password">סיסמה*</label>
                                {formik.touched.password && formik.errors.password && (
                                    <p>{formik.errors.password}</p>
                                )}
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" disabled={!formik.isValid || !formik.dirty}>כניסה</button>
                    </form>
                    <button className="btn-secondary" onClick={() => navigate("/register")}>עוד לא חברים ב-Eatlist? הירשמו כאן</button>
                </div>
            </div>
            <Footer />
        </div>
    </>);
}
 
export default Login;