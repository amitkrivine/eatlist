
import { useFormik } from "formik";
import * as yup from "yup";
import { FunctionComponent } from "react";
import { useNavigate } from "react-router-dom";
import User from "../interfaces/User";
import "../style/register.css";
import "../style/global-assets.css";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { register } from "../services/UserService";
import Swal from "sweetalert2";
import Footer from "./Footer";

interface RegisterProps {
    
}
 
const Register: FunctionComponent<RegisterProps> = () => {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {name: {first: "", last: ""}, phone: "", email: "", password: "", address: {city: "", street: "", houseNumber: 0}, imageUrl: ""},
        validationSchema: yup.object({
            name: yup.object({
                first: yup.string().required("שם פרטי הוא שדה חובה").min(2, "שם פרטי חייב לכלול לפחות 2 תווים"),
                last: yup.string().required("שם משפחה הוא שדה חובה").min(2, "שם משפחה חייב לכלול לפחות 2 תווים")
            }),
            phone: yup.string().required("טלפון הוא שדה חובה").matches(/^(?:\+972|0)(?:[2-9]|5[0-9])[-\s]?\d{3}[-\s]?\d{4}$/, "phone number must match the Israeli format"),
            email: yup.string().required("מייל הוא שדה חובה").email("תוכן השדה אינו כתובת מייל").min(5, "מייל חייב לכלול לפחות 5 תווים"),
            password: yup.string().required("סיסמה היא שדה חובה").matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9].*[0-9].*[0-9].*[0-9])(?=.*[!@#$%^&*_-]).{8,}$/, "על הסיסמה לכלול לפחות 8 תווים, ביניהם אות גדולה, אות קטנה, לפחות 4 ספרות, וסימן מיוחד"),
            address: yup.object({
                street: yup.string(),
                houseNumber: yup.number(),
                city: yup.string()
            }),
            imageUrl: yup.string()
        }),
        onSubmit: (values) => {
            const user: User = {
                name: {
                    first: values.name.first,
                    last: values.name.last
                },
                phone: values.phone,
                email: values.email,
                password: values.password,
                address: {
                    city: values.address.city,
                    street: values.address.street,
                    houseNumber: values.address.houseNumber
                },
                imageUrl: values.imageUrl
            };
            register(user)
                .then((response) => {
                    localStorage.setItem("token", response.data);
                    navigate("/");
                    Swal.fire({
                        title: "עדכון הערה",
                        text: "העדכון בוצע בהצלחה",
                        icon: "success",
                        timer: 1800,
                        showConfirmButton: false,
                    });
                })
                .catch((error) => {
                    console.error("Error registering user:", error);
                    Swal.fire({
                        icon: "error",
                        title: "שגיאה בהרשמה",
                        text: "אירעה שגיאה בעת יצירת החשבון. נסו שוב",
                        confirmButtonText: "חזרה"
                    });
                })
        }
    })

    return (<>
        <Navbar/>
        <Sidebar/>
        <main className="container justify-spacebt" lang="he">
            <div className="page-content">
                <img src="https://cdn.dribbble.com/userupload/31776407/file/original-9912ad5f5772dc1e836e97350967fa3f.jpg" alt="eatlist" className="image-overlay"/>
                <div className="container-content z-index-front">
                    <h2 className="section-header-text extra-spacing centered">יצירת חשבון</h2>
                    <form onSubmit={formik.handleSubmit} className="form">
                        <div className="form-section">
                            <div className="form-control">
                                <input type="text" id="name.first" name="name.first" placeholder=" " value={formik.values.name.first} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="name.first">שם פרטי*</label>
                                {formik.touched.name?.first && formik.errors.name?.first && (
                                    <p>{formik.errors.name?.first}</p>
                                )}
                            </div>
                            <div className="form-control">
                                <input type="text" id="name.last" name="name.last" placeholder=" " value={formik.values.name.last} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="name.last">שם משפחה*</label>
                                {formik.touched.name?.last && formik.errors.name?.last && (
                                    <p>{formik.errors.name?.last}</p>
                                )}
                            </div>
                            <div className="form-control">
                                <input type="text" id="phone" name="phone" placeholder=" " value={formik.values.phone} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="phone">טלפון*</label>
                                {formik.touched.phone && formik.errors.phone && (
                                    <p>{formik.errors.phone}</p>
                                )}
                            </div>
                            <div className="form-control">
                                <input type="text" id="email" name="email" placeholder=" " value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="email">מייל*</label>
                                {formik.touched.email && formik.errors.email && (
                                    <p>{formik.errors.email}</p>
                                )}
                            </div>
                            <div className="form-control">
                                <input type="text" id="password" name="password" placeholder=" " value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="password">סיסמה*</label>
                                {formik.touched.password && formik.errors.password && (
                                    <p>{formik.errors.password}</p>
                                )}
                            </div>
                            <div className="form-control">
                                <input type="text" id="address.street" name="address.street" placeholder=" " value={formik.values.address.street} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="address.street">רחוב</label>
                                {formik.touched.address?.street && formik.errors.address?.street && (
                                    <p>{formik.errors.address?.street}</p>
                                )}
                            </div>
                            <div className="form-control">
                                <input type="number" id="address.houseNumber" name="address.houseNumber" placeholder="0" value={formik.values.address.houseNumber} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="address.houseNumber">מספר</label>
                                {formik.touched.address?.houseNumber && formik.errors.address?.houseNumber && (
                                    <p>{formik.errors.address?.houseNumber}</p>
                                )}
                            </div>
                            <div className="form-control">
                                <input type="text" id="address.city" name="address.city" placeholder=" " value={formik.values.address.city} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="address.city">עיר</label>
                                {formik.touched.address?.city && formik.errors.address?.city && (
                                    <p>{formik.errors.address?.city}</p>
                                )}
                            </div>
                            <div className="form-control">
                                <input type="text" id="imageUrl" name="imageUrl" placeholder=" " value={formik.values.imageUrl} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="imageUrl">קישור לתמונה</label>
                                {formik.touched.imageUrl && formik.errors.imageUrl && (
                                    <p>{formik.errors.imageUrl}</p>
                                )}
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" disabled={!formik.isValid || !formik.dirty}>הרשמה</button>
                    </form>
                </div>
            </div>
            <Footer />
        </main>
    </>);
}
 
export default Register;