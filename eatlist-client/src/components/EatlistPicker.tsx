import { FunctionComponent, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Eatlist from "../interfaces/Eatlist";
import { getAllEatlists, addRestaurantToEatlist } from "../services/EatlistService";
import { decodeToken } from "../services/UserService";
import Swal from "sweetalert2";

interface EatlistPickerProps {
    restaurantId: string;
    onClose: () => void;
}

const EatlistPicker: FunctionComponent<EatlistPickerProps> = ({ restaurantId, onClose }) => {
    const [createdEatlists, setCreatedEatlists] = useState<Eatlist[]>([]);
    const [selectedEatlistId, setSelectedEatlistId] = useState<string | null>(null);

    useEffect(() => {
        const token = decodeToken();
        if (!token?._id) return;

        getAllEatlists()
            .then((response) => {
                const created = response.data.filter((eatlist: Eatlist) => eatlist.userId === token._id);
                setCreatedEatlists(created);
            })
            .catch((error) => {
                console.log(error);
                Swal.fire({
                    title: "...אופס",
                    text: "משהו השתבש בהצגת המידע. נסו שוב",
                    icon: "error",
                    confirmButtonText: "חזרה"
                })
            });
    }, []);

    const handleApply = () => {
        if (!selectedEatlistId) return;

        addRestaurantToEatlist(selectedEatlistId, restaurantId)
            .then(() => {
                window.dispatchEvent(new CustomEvent("eatlistChanged"));
                Swal.fire({
                    title: "המסעדה נוספה בהצלחה!",
                    icon: "success",
                    timer: 1800,
                    showConfirmButton: false,
                });
                onClose();
            })
            .catch((error) => {
                if (error.response?.data === "Restaurant already in eatlist") {
                    Swal.fire({
                        title: "המסעדה כבר קיימת ב-Eatlist",
                        icon: "error",
                        showConfirmButton: true,
                    });
                } else {
                    Swal.fire({
                        title: "...אופס",
                        text: "משהו השתבש. נסו שוב",
                        icon: "error",
                        confirmButtonText: "חזרה"
                    })
                }
            });
    };

    return ReactDOM.createPortal(
        <div className="portal-overlay" onClick={onClose}>
            <div className="filter-modal-content modal-on-modal" onClick={(e) => e.stopPropagation()} lang="he">
                <h2 className="filter-title">הוספה ל-<span lang="en">Eatlist</span></h2>
                {createdEatlists.length === 0 ? (
                    <p className="note-text">לא נמצאו Eatlists. צור Eatlist חדשה מהספרייה.</p>
                ) : (
                    <div className="search-list-container">
                        {createdEatlists.map((eatlist) => (
                            <div key={eatlist._id} className="filter-option">
                                <input
                                    type="radio"
                                    id={eatlist._id}
                                    name="eatlist"
                                    value={eatlist._id}
                                    checked={selectedEatlistId === eatlist._id}
                                    onChange={() => setSelectedEatlistId(eatlist._id as string)}
                                />
                                <label htmlFor={eatlist._id}>{eatlist.name}</label>
                            </div>
                        ))}
                    </div>
                )}
                <button
                    className="btn-primary apply-btn"
                    onClick={handleApply}
                    disabled={!selectedEatlistId}
                >
                    הוספה
                </button>
                <button className="btn-secondary" type="button" onClick={onClose}>
                    ביטול
                </button>
            </div>
        </div>,
        document.body
    );
};

export default EatlistPicker;