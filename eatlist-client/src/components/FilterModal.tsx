import { FunctionComponent, useEffect, useState } from "react";
import Restaurant from "../interfaces/Restaurant";
import { getAllRestaurants } from "../services/RestaurantService";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Loader from "./Loader";
import Swal from "sweetalert2";

interface FilterModalProps {
    
}
 
const FilterModal: FunctionComponent<FilterModalProps> = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const backgroundParams = new URLSearchParams(location.state?.background?.search || "");

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [selectedGenres, setSelectedGenres] = useState<string[]>(
        backgroundParams.getAll("genre")
    );
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [genres, setGenres] = useState<string[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
    
    useEffect(() => {
        getAllRestaurants()
            .then((response) => {
                setRestaurants(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
                Swal.fire({
                    title: "...אופס",
                    text: "משהו השתבש. נסו שוב",
                    icon: "error",
                    confirmButtonText: "חזרה"
                })
            });
    }, []);

    useEffect(() => {
        if (restaurants) {
            const uniqueGenres: string[] = [];
            restaurants.forEach((r) => {
                if (!uniqueGenres.includes(r.genre)) {
                    uniqueGenres.push(r.genre);
                }
            });
            setGenres(uniqueGenres);
        }
    }, [restaurants]);

    const handleApply = () => {
        const params = new URLSearchParams();
        selectedGenres.forEach((genre) => params.append("genre", genre));
        navigate(`/restaurants?${params.toString()}`);
    };

    const handleClear = () => {
        setSelectedGenres([]);
        navigate("/restaurants");
    };

    return (<>
    {isLoading ? (<>
        <div className="modal-container">
            <Loader />
        </div>
    </>) : (<>    
        {genres.length ? (
            <div className="modal-container" lang="he">
                <div className="filter-modal-content">
                    <h2 className="filter-title">סינון מסעדות</h2>
                    <div className="filter-container">
                        {genres.map((genre) => (
                            <div key={genre} className="filter-option">
                                <input type="checkbox" id={genre} name={genre} value={genre} checked={selectedGenres.includes(genre)} onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedGenres((prev) => [...prev, genre]);
                                        } else {
                                            setSelectedGenres((prev) => prev.filter((g) => g !== genre));
                                        }
                                    }}
                                />
                                <label htmlFor={genre}>{genre}</label>
                            </div>
                        ))}
                    </div>
                    <button className="btn-primary" onClick={handleApply}>חיפוש</button>
                    <button className="btn-secondary" type="button" onClick={handleClear} disabled={selectedGenres.length === 0} style={{marginBottom:"16px"}}>
                        נקה הכל
                    </button>
                </div>
            </div>
        ) : (
            <p>Error loading filters</p>
        )}
    </>)}
    </>);
}
 
export default FilterModal;