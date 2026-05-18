import { FunctionComponent, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Restaurant from "../interfaces/Restaurant";
import { getAllRestaurants } from "../services/RestaurantService";
import { addRestaurantToEatlist } from "../services/EatlistService";
import Swal from "sweetalert2";

interface RestaurantPickerProps {}

const PAGE_SIZE = 12;

const RestaurantPicker: FunctionComponent<RestaurantPickerProps> = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [selectedRestaurants, setSelectedRestaurants] = useState<Restaurant[]>([]);
    const [search, setSearch] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);

    const { id } = useParams();

    useEffect(() => {
        getAllRestaurants()
            .then((response) => setRestaurants(response.data))
            .catch((error) => {
                console.log(error);
                Swal.fire({
                    title: "...אופס",
                    text: "משהו השתבש. נסו שוב",
                    icon: "error",
                    confirmButtonText: "חזרה"
                });
            });
    }, []);

    // reset to page 1 whenever search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const filtered = restaurants.filter((r) =>
        r.name.main.toLowerCase().includes(search.toLowerCase()) ||
        r.name.alt?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleApply = () => {
        const promises = selectedRestaurants.map((restaurant) =>
            addRestaurantToEatlist(id as string, restaurant._id as string)
        );
    
        Promise.allSettled(promises)
            .then((results) => {
                const duplicates = results.filter(
                    (r) => r.status === "rejected" && r.reason?.response?.data === "Restaurant already in eatlist"
                );
                const successes = results.filter((r) => r.status === "fulfilled");
    
                if (successes.length > 0) {
                    navigate(`/eatlist/${id}`, { state: { refresh: Date.now() } });
                }
    
                if (duplicates.length > 0 && successes.length > 0) {
                    Swal.fire({
                        title: "חלק מהמסעדות נוספו לרשימה",
                        text: `${successes.length} מסעדות נוספו, ${duplicates.length} כבר קיימות ב-Eatlist`,
                        icon: "warning",
                        showConfirmButton: true,
                    });
                } else if (duplicates.length > 0 && successes.length === 0) {
                    Swal.fire({
                        title: "המסעדות כבר קיימות ב-Eatlist",
                        icon: "error",
                        showConfirmButton: true,
                    });
                } else {
                    Swal.fire({
                        title: "המסעדות נוספו בהצלחה!",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1800,
                    });
                }
            })
            .catch((error) => {
                console.log(error);
                Swal.fire({
                    title: "...אופס",
                    text: "משהו השתבש. נסו שוב",
                    icon: "error",
                    confirmButtonText: "חזרה"
                });
            });
    };

    return (
        <div className="modal-container" lang="he">
            <div className="filter-modal-content">
                <h2 className="filter-title">בחרו מסעדה להוספה לרשימה</h2>

                <div className="search-bar">
                    <div className="search-container">
                        <input type="text" placeholder="חיפוש מסעדה" value={search} onChange={(e) => setSearch(e.target.value)} className="search-input"/>
                    </div>
                    <i className="fa-solid fa-magnifying-glass search-icon"></i>
                </div>

                <div className="search-list-container">
                    {paginated.map((restaurant) => (
                        <div key={restaurant._id} className="filter-option">
                            <input type="checkbox" id={restaurant._id} name={restaurant.name.main} value={restaurant._id} checked={selectedRestaurants.some((r) => r._id === restaurant._id)} onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedRestaurants((prev) => [...prev, restaurant]);
                                } else {
                                    setSelectedRestaurants((prev) => prev.filter((r) => r._id !== restaurant._id));
                                }
                            }}/>
                            <label htmlFor={restaurant._id}>{restaurant.name.main}</label>
                        </div>
                    ))}
                    {paginated.length === 0 && <p>לא נמצאו מסעדות</p>}
                </div>

                <div className="pagination">
                    <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>
                        &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button key={page} onClick={() => setCurrentPage(page)} className={currentPage === page ? "active-page" : ""}>
                            {page}
                        </button>
                    ))}
                    <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>
                        &gt;
                    </button>
                </div>

                <button className="btn-primary apply-btn" onClick={handleApply}>החל</button>
            </div>
        </div>
    );
};

export default RestaurantPicker;