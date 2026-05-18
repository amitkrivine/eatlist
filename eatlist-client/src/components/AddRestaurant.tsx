import { FunctionComponent, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { decodeToken, getUserById } from "../services/UserService";
import Swal from "sweetalert2";
import Token from "../interfaces/Token";
import { useFormik } from "formik";
import * as yup from "yup";
import Restaurant from "../interfaces/Restaurant";
import { addRestaurant, getRestaurantById } from "../services/RestaurantService";

interface AddRestaurantProps {}

const AddRestaurant: FunctionComponent<AddRestaurantProps> = () => {
    const navigate = useNavigate();

    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        const token: Token | null = decodeToken();
        !token?.isAdmin ? setIsAdmin(false) : setIsAdmin(true);
    }, []);

    const formik = useFormik({
        initialValues: {
            displayName: "",
            altName: "",
            description: "",
            imageUrl: "",
            city: "",
            street: "",
            houseNumber: 0,
            genre: "",
            phone: "",
            reservations: "",
            website: "",
            menu: "",
            instagram: ""
        },
        validationSchema: yup.object({
            displayName: yup.string().required("שדה שם תצוגה הוא שדה חובה"),
            altName: yup.string().required("שדה שם נוסף הוא שדה חובה"),
            description: yup.string().required("שדה התיאור הוא שדה חובה").min(6, "על התיאור לכלול לפחות 6 תווים"),
            imageUrl: yup.string().required(),
            city: yup.string(),
            street: yup.string(),
            houseNumber: yup.number(),
            genre: yup.string().required("שדה הז׳אנר הוא שדה חובה"),
            phone: yup.string(),
            reservations: yup.string(),
            website: yup.string(),
            menu: yup.string(),
            instagram: yup.string()
        }),
        onSubmit: (values) => {
            const payload = {
                name: {
                    main: values.displayName,
                    alt: values.altName
                },
                description: values.description,
                imageUrl: values.imageUrl,
                address: {
                    city: values.city,
                    street: values.street,
                    houseNumber: values.houseNumber
                },
                genre: values.genre,
                phone: values.phone,
                urls: {
                    reservations: values.reservations,
                    website: values.website,
                    menu: values.menu,
                    instagram: values.instagram
                }
            };
            addRestaurant(payload as Restaurant)
                .then((response) => {
                    window.dispatchEvent(new CustomEvent("restaurantChanged"));
                    navigate(`/restaurant-management`, { state: { refresh: Date.now() } });
                    Swal.fire({
                        title: "הוספת מסעדה",
                        text: "ההוספה בוצעה בהצלחה",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false
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
    });

    return (<>
    {!isAdmin ? (
        <p>אין הרשאה: רק משתמש מנהל יכול להוסיף מסעדות</p>
    ) : (
        <div className="modal-container" lang="he">
            <div className="filter-modal-content">
                <h2 className="filter-title">הוספת מסעדה</h2>
                <form onSubmit={formik.handleSubmit} className="form wide-form">
                    <div className="form-section-small">
                        <div className="form-control">
                            <input type="text" id="displayName" name="displayName" placeholder=" " value={formik.values.displayName} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                            <label htmlFor="displayName">שם תצוגה*</label>
                            {formik.touched.displayName && formik.errors.displayName && (
                                <p>{formik.errors.displayName}</p>
                            )}
                        </div>
                        <div className="form-control">
                            <input type="text" id="altName" name="altName" placeholder=" " value={formik.values.altName} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                            <label htmlFor="altName">שם נוסף*</label>
                            {formik.touched.altName && formik.errors.altName && (
                                <p>{formik.errors.altName}</p>
                            )}
                        </div>
                    </div>
                    <div className="form-section-small">
                        <div className="form-control">
                            <textarea id="description" name="description" placeholder=" " value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                            <label htmlFor="description">תיאור המסעדה*</label>
                            {formik.touched.description && formik.errors.description && (
                                <p>{formik.errors.description}</p>
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
                            <label htmlFor="city">עיר*</label>
                            {formik.touched.city && formik.errors.city && (
                                <p>{formik.errors.city}</p>
                            )}
                        </div>
                    </div>
                    <div className="form-section-small">
                        <div className="form-control">
                            <input type="text" id="street" name="street" placeholder=" " value={formik.values.street} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                            <label htmlFor="street">רחוב*</label>
                            {formik.touched.street && formik.errors.street && (
                                <p>{formik.errors.street}</p>
                            )}
                        </div>
                    </div>
                    <div className="form-section-small">
                        <div className="form-control">
                            <input type="number" id="houseNumber" name="houseNumber" placeholder=" " value={formik.values.houseNumber} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                            <label htmlFor="houseNumber">מס׳ בית*</label>
                            {formik.touched.houseNumber && formik.errors.houseNumber && (
                                <p>{formik.errors.houseNumber}</p>
                            )}
                        </div>
                    </div>
                    <div className="form-section-small">
                        <div className="form-control">
                            <input type="text" id="genre" name="genre" placeholder=" " value={formik.values.genre} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                            <label htmlFor="genre">ז׳אנר*</label>
                            {formik.touched.genre && formik.errors.genre && (
                                <p>{formik.errors.genre}</p>
                            )}
                        </div>
                    </div>
                    <div className="form-section-small">
                        <div className="form-control">
                            <input type="text" id="imageUrl" name="imageUrl" placeholder=" " value={formik.values.imageUrl} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                            <label htmlFor="imageUrl">קישור לתמונה*</label>
                            {formik.touched.imageUrl && formik.errors.imageUrl && (
                                <p>{formik.errors.imageUrl}</p>
                            )}
                        </div>
                    </div>
                    <div className="form-section-small">
                        <div className="form-control">
                            <input type="text" id="reservations" name="reservations" placeholder=" " value={formik.values.reservations} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                            <label htmlFor="reservations">קישור להזמנת מקום</label>
                            {formik.touched.reservations && formik.errors.reservations && (
                                <p>{formik.errors.reservations}</p>
                            )}
                        </div>
                    </div>
                    <div className="form-section-small">
                        <div className="form-control">
                            <input type="text" id="website" name="website" placeholder=" " value={formik.values.website} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                            <label htmlFor="website">קישור לאתר הבית</label>
                            {formik.touched.website && formik.errors.website && (
                                <p>{formik.errors.website}</p>
                            )}
                        </div>
                    </div>
                    <div className="form-section-small">
                        <div className="form-control">
                            <input type="text" id="menu" name="menu" placeholder=" " value={formik.values.menu} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                            <label htmlFor="menu">קישור לתפריט</label>
                            {formik.touched.menu && formik.errors.menu && (
                                <p>{formik.errors.menu}</p>
                            )}
                        </div>
                    </div>
                    <div className="form-section-small">
                        <div className="form-control">
                            <input type="text" id="instagram" name="instagram" placeholder=" " value={formik.values.instagram} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                            <label htmlFor="instagram">קישור לאינסטגרם</label>
                            {formik.touched.instagram && formik.errors.instagram && (
                                <p>{formik.errors.instagram}</p>
                            )}
                        </div>
                    </div>
                    <button type="submit" className="btn-primary apply-btn" disabled={!formik.isValid || !formik.dirty}>הוספת מסעדה</button>
                </form>
            </div>
        </div>
    )}
    </>);
};

export default AddRestaurant;