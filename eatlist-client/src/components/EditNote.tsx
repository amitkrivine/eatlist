import { FunctionComponent, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Eatlist from "../interfaces/Eatlist";
import User from "../interfaces/User";
import { decodeToken, getUserById } from "../services/UserService";
import Swal from "sweetalert2";
import Token from "../interfaces/Token";
import { getEatlistById, updateEatlist } from "../services/EatlistService";
import { useFormik } from "formik";
import * as yup from "yup";
import { EatlistRestaurant } from "../interfaces/EatlistRestaurant";

interface EditNoteProps {}

const EditNote: FunctionComponent<EditNoteProps> = () => {
    const navigate = useNavigate();
    const { id, restaurantId } = useParams();

    const [eatlist, setEatlist] = useState<Eatlist>();
    const [eatlistByUser, setEatlistByUser] = useState<boolean>(false);
    const [eatlistRestaurant, setEatlistRestaurant] = useState<EatlistRestaurant>();

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
            const token: Token | null = decodeToken();
            if (token?._id && eatlist.userId === token._id) {
                setEatlistByUser(true);
            } else {
                setEatlistByUser(false);
            }

            // find the specific restaurant in the eatlist
            const found = eatlist.restaurants.find((r) => r._id === restaurantId);
            setEatlistRestaurant(found);
        }
    }, [eatlist]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            userNote: eatlistRestaurant?.userNote || ""
        },
        validationSchema: yup.object({
            userNote: yup.string().min(2, "על ההערה לכלול לפחות 2 תווים")
        }),
        onSubmit: (values) => {
            if (!eatlist) return;

            // update only the userNote of the specific restaurant
            const updatedRestaurants = eatlist.restaurants.map((r) =>
                r._id === restaurantId ? { ...r, userNote: values.userNote } : r
            );

            const updatedEatlist = { ...eatlist, restaurants: updatedRestaurants };

            updateEatlist(eatlist._id as string, updatedEatlist)
                .then(() => {
                    Swal.fire({
                        title: "עדכון הערה",
                        text: "העדכון בוצע בהצלחה",
                        icon: "success",
                        timer: 1800,
                        showConfirmButton: false,
                    });
                    navigate(`/eatlist/${eatlist._id}`, { state: { refresh: Date.now() } });
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
        }
    });

    return (<>
        {eatlistByUser ? (
            <div className="modal-container" lang="he">
                <div className="filter-modal-content">
                    <h2 className="filter-title">
                        {eatlistRestaurant?.userNote ? "עריכת הערה" : "הוספת הערה"}
                    </h2>
                    <form onSubmit={formik.handleSubmit} className="form wide-form">
                        <div className="form-section-small">
                            <div className="form-control">
                                <input type="text" id="userNote" name="userNote" placeholder=" " value={formik.values.userNote} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                                <label htmlFor="userNote">הערה</label>
                                {formik.touched.userNote && formik.errors.userNote && (
                                    <p className="error-text">{formik.errors.userNote}</p>
                                )}
                            </div>
                        </div>
                        <button type="submit" className="btn-primary apply-btn" disabled={!formik.isValid || !formik.dirty}>
                            {eatlistRestaurant?.userNote ? "עדכון הערה" : "הוספת הערה"}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
                            חזרה
                        </button>
                    </form>
                </div>
            </div>
        ) : (
            <p>אין הרשאה: משתמשים יכולים לערוך רק את הרשימות שנוצרו על ידם</p>
        )}
    </>);
};

export default EditNote;