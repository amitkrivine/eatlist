import { useFormik } from "formik";
import * as yup from "yup";
import { FunctionComponent, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Eatlist from "../interfaces/Eatlist";
import { getEatlistById, updateEatlist } from "../services/EatlistService";
import { decodeToken, getUserById } from "../services/UserService";
import User from "../interfaces/User";
import Swal from "sweetalert2";
import Token from "../interfaces/Token";

interface EditEatlistProps {
    
}
 
const EditEatlist: FunctionComponent<EditEatlistProps> = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const [eatlist, setEatlist] = useState<Eatlist>();
    const [user, setUser] = useState<User>();
    const [eatlistByUser, setEatlistByUser] = useState<boolean>(false);

    useEffect(() => {
        getEatlistById(id as string)
            .then((response) => setEatlist(response.data))
            .catch((error) => {
                console.log(error);
                Swal.fire({
                    title: "...אופס",
                    text: "משהו השתבש. נסו שוב",
                    icon: "error",
                    confirmButtonText: "חזרה"
                })
            });
    }, []);

    useEffect(() => {
            if (eatlist) {
                getUserById(eatlist.userId)
                    .then((response) => setUser(response.data))
                    .catch((error) => {
                        console.log(error);
                        Swal.fire({
                            title: "...אופס",
                            text: "משהו השתבש. נסו שוב",
                            icon: "error",
                            confirmButtonText: "חזרה"
                        })
                    }
                )
            }
    
            const token: Token | null = decodeToken();
            if (token?._id && eatlist?.userId === token._id) {
                setEatlistByUser(true);
            } else {
                setEatlistByUser(false);
            }
        }, [eatlist]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: eatlist?.name || "",
            description: eatlist?.description || "",
            imageUrl: eatlist?.imageUrl || ""
        },
        validationSchema: yup.object({
            name: yup.string().required("שדה השם הוא שדה חובה"),
            description: yup.string().min(3, "על התיאור לכלול לפחות 3 תווים"),
            imageUrl: yup.string()
        }),
        onSubmit: (values) => {
            const updatedPayload = {
                ...eatlist,
                ...values
            };
            updateEatlist(eatlist?._id as string, updatedPayload as Eatlist)
                .then((response) => {
                    window.dispatchEvent(new CustomEvent("eatlistChanged"));
                    navigate(`/eatlist/${eatlist?._id}`, { state: { refresh: Date.now() } });
                    Swal.fire({
                        title: "עדכון Eatlist",
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
    });
    
    return (<>
    {eatlistByUser ? (
        <div className="modal-container" lang="he">
            <div className="filter-modal-content">
                <h2 className="filter-title">עריכת <span lang="en" style={{fontWeight:600}}>Eatlist</span></h2>
                <form onSubmit={formik.handleSubmit} className="form wide-form">
                    <div className="form-section-small">
                        <div className="form-control">
                            <input type="text" id="name" name="name" placeholder=" " value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                            <label htmlFor="name">שם ה-<span lang="en">Eatlist</span></label>
                            {formik.touched.name && formik.errors.name && (
                                <p>{formik.errors.name}</p>
                            )}
                        </div>
                    </div>
                    <div className="form-section-small">
                        <div className="form-control">
                            <input type="text" id="description" name="description" placeholder=" " value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                            <label htmlFor="description">תיאור ה-<span lang="en">Eatlist</span></label>
                            {formik.touched.description && formik.errors.description && (
                                <p>{formik.errors.description}</p>
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
                    <button type="submit" className="btn-primary apply-btn" disabled={!formik.isValid || !formik.dirty}>עדכון רשימה</button>
                </form>
            </div>
        </div>
    ) : (
        <p>אין הרשאה: משתמשים יכולים לערוך רק את הרשימות שנוצרו על ידם</p>
    )}
    </>);
}
 
export default EditEatlist;