import { FunctionComponent, useState, useEffect, use } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import User from "../interfaces/User";
import { decodeToken, getUserById, updateUser } from "../services/UserService";
import Token from "../interfaces/Token";
import Swal from "sweetalert2";

interface EditUserProps {
    
}
 
const EditUser: FunctionComponent<EditUserProps> = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [user, setUser] = useState<User>();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
            getUserById(id as string)
                .then((response) => {
                    setUser(response.data);
                })
                .catch((error) => {
                    console.log(error);
                    Swal.fire({
                        title: "...אופס",
                        text: "משהו השתבש. נסו שוב",
                        icon: "error",
                        confirmButtonText: "חזרה"
                    })
                });
    
            const token: Token | null = decodeToken();
            !token?.isAdmin ? setIsAdmin(false) : setIsAdmin(true);
        }, []);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            firstName: user?.name.first || "",
            lastName: user?.name.last || "",
            phone: user?.phone || "",
            email: user?.email || "",
            city: user?.address.city || "",
            street: user?.address.street || "",
            houseNumber: user?.address.houseNumber || 0,
            imageUrl: user?.imageUrl || ""
        },
        validationSchema: yup.object({
            firstName: yup.string().required("שדה שם פרטי הוא שדה חובה"),
            lastName: yup.string().required("שדה שם משפחה הוא שדה חובה"),
            phone: yup.string().required("שדה טלפון הוא שדה חובה"),
            email: yup.string().required("שדה אימייל הוא שדה חובה"),
            city: yup.string(),
            street: yup.string(),
            houseNumber: yup.number(),
            imageUrl: yup.string()
        }),
        onSubmit: (values) => {
            const payload = {
                name: {
                    first: values.firstName,
                    last: values.lastName
                },
                phone: values.phone,
                email: values.email,
                address: {
                    city: values.city,
                    street: values.street,
                    houseNumber: values.houseNumber
                },
                imageUrl: values.imageUrl
            };

            updateUser(user?._id as string, payload as User)
                .then((response) => {
                    window.dispatchEvent(new CustomEvent("userChanged"));
                    navigate(`/user-management`, { state: { refresh: Date.now() } });
                    Swal.fire({
                        title: "עדכון משתמש",
                        text: "העדכון בוצע בהצלחה",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                })
                .catch((error) => {
                    console.log(error);
                    Swal.fire({
                        title: "...אופס",
                        text: "משהו השתבש. נסו שוב",
                        icon: "error",
                        confirmButtonText: "חזרה"
                    })
                })
        }
    })
    return (<>
        {!isAdmin ? (
            <p>אין הרשאה: רק משתמש מנהל יכול לערוך משתמשים</p>
        ) : (
            <div className="modal-container" lang="he">
                {!user ? (
                    <p>משתמש לא נמצא במאגר</p>
                ) : (
                <div className="filter-modal-content">
                    <h2 className="filter-title">עריכת משתמש</h2>
                    <form onSubmit={formik.handleSubmit} className="form wide-form">
                        <div className="form-section-small">
                            <div className="form-control">
                                <input type="text" id="firstName" name="firstName" placeholder=" " value={formik.values.firstName} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="firstName">שם פרטי</label>
                                {formik.touched.firstName && formik.errors.firstName && (
                                    <p>{formik.errors.firstName}</p>
                                )}
                            </div>
                            <div className="form-control">
                                <input type="text" id="lastName" name="lastName" placeholder=" " value={formik.values.lastName} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="lastName">שם משפחה</label>
                                {formik.touched.lastName && formik.errors.lastName && (
                                    <p>{formik.errors.lastName}</p>
                                )}
                            </div>
                        </div>
                        <div className="form-section-small">
                            <div className="form-control">
                                <input type="email" id="email" name="email" placeholder=" " value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="email">אימייל</label>
                                {formik.touched.email && formik.errors.email && (
                                    <p>{formik.errors.email}</p>
                                )}
                            </div>
                        </div>
                        <div className="form-section-small">
                            <div className="form-control">
                                <input type="text" id="phone" name="phone" placeholder=" " value={formik.values.phone} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="phone">טלפון</label>
                                {formik.touched.phone && formik.errors.phone && (
                                    <p>{formik.errors.phone}</p>
                                )}
                            </div>
                        </div>                    
                        <div className="form-section-small">
                            <div className="form-control">
                                <input type="text" id="city" name="city" placeholder=" " value={formik.values.city} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="city">עיר</label>
                                {formik.touched.city && formik.errors.city && (
                                    <p>{formik.errors.city}</p>
                                )}
                            </div>
                        </div>
                        <div className="form-section-small">
                            <div className="form-control">
                                <input type="text" id="street" name="street" placeholder=" " value={formik.values.street} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="street">רחוב</label>
                                {formik.touched.street && formik.errors.street && (
                                    <p>{formik.errors.street}</p>
                                )}
                            </div>
                        </div>
                        <div className="form-section-small">
                            <div className="form-control">
                                <input type="number" id="houseNumber" name="houseNumber" placeholder=" " value={formik.values.houseNumber} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="houseNumber">מס׳ בית</label>
                                {formik.touched.houseNumber && formik.errors.houseNumber && (
                                    <p>{formik.errors.houseNumber}</p>
                                )}
                            </div>
                        </div>
                        <div className="form-section-small">
                            <div className="form-control">
                                <input type="text" id="imageUrl" name="imageUrl" placeholder=" " value={formik.values.imageUrl} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="imageUrl">קישור לתמונה</label>
                                {formik.touched.imageUrl && formik.errors.imageUrl && (
                                    <p>{formik.errors.imageUrl}</p>
                                )}
                            </div>
                        </div>
                        <button type="submit" className="btn-primary apply-btn" disabled={!formik.isValid || !formik.dirty}>עדכון משתמש</button>
                    </form>
                </div>
                )}
            </div>
        )}
        </>);
}
 
export default EditUser;