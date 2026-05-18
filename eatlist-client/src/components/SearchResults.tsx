import { FunctionComponent, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import Restaurant from "../interfaces/Restaurant";
import Eatlist from "../interfaces/Eatlist";
import { getAllRestaurants } from "../services/RestaurantService";
import { getAllEatlists } from "../services/EatlistService";
import "../style/card-pages.css";
import User from "../interfaces/User";
import { decodeToken, getUserById } from "../services/UserService";
import Swal from "sweetalert2";

interface SearchResultsProps {}

const SearchResults: FunctionComponent<SearchResultsProps> = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q")?.toLowerCase() || "";
    const location = useLocation();
    const userToken = decodeToken();

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [eatlists, setEatlists] = useState<Eatlist[]>([]);
    const [user, setUser] = useState<User>();

    const getLang = (text: string) => {
        const hebrewPattern = /[\u0590-\u05FF]/;
        return hebrewPattern.test(text) ? "he" : "en";
    };

    useEffect(() => {
        getAllRestaurants()
            .then((res) => setRestaurants(res.data))
            .catch((err) => {
                console.log(err);
                Swal.fire({
                    title: "...אופס",
                    text: "משהו השתבש. נסו שוב",
                    icon: "error",
                    confirmButtonText: "חזרה"
                });
            });

        getAllEatlists()
            .then((response) => setEatlists(response.data))
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

    const filteredRestaurants = restaurants.filter((r) =>
        r.name.main.toLowerCase().includes(query) ||
        r.name.alt?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.address.city?.toLocaleLowerCase().includes(query) ||
        r.address.street?.toLocaleLowerCase().includes(query) ||
        r.genre.toLowerCase().includes(query) ||
        `${r.address.street} ${r.address.houseNumber}, ${r.address.city}`.toLowerCase().includes(query)
    );

    const filteredEatlists = eatlists.filter((e) =>
        e.isPublic && (
            e.name.toLowerCase().includes(query) ||
            e.description?.toLowerCase().includes(query)
        )
    );

    return (<>
        <Navbar />
        <Sidebar />
        <main className="container-home" lang="he">
            <div className="homepage-section">
                <div className="search-results-container">
                    <h2 className="search-results-title">תוצאות עבור "{query}"</h2>
                    <h3 className="section-header-text">מסעדות</h3>
                    {filteredRestaurants.length === 0 ? (
                        <p className="no-results">לא נמצאו מסעדות</p>
                    ) : (
                        <div className="restaurant-cards">
                            {filteredRestaurants.map((restaurant) => (
                                <Link to={`/restaurants/${restaurant._id}`} state={{ background: location }} className="single-card" key={restaurant._id}>
                                    <div className="single-card" lang="he">
                                        <img src={restaurant.imageUrl} alt={restaurant.name.main} className="card-image" />
                                        <p className="card-tag">{restaurant.genre}</p>
                                        <div className="card-info">
                                            <h3 className="card-header" lang={getLang(restaurant.name.main)} style={{ direction: "rtl", fontWeight: 600 }}>
                                                {restaurant.name.main}
                                            </h3>
                                            <p className="card-text">
                                                {restaurant.address.street} {restaurant.address.houseNumber}, {restaurant.address.city}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <h3 className="section-header-text">Eatlists</h3>
                    {filteredEatlists.length === 0 ? (
                        <p className="no-results">לא נמצאו Eatlists</p>
                    ) : (
                        <div className="restaurant-cards">
                            {filteredEatlists.map((eatlist) => (
                                <Link to={`/eatlist/${eatlist._id}`} className="single-card" key={eatlist._id}>
                                    <div className="single-card" lang="he">
                                        <img src={eatlist.imageUrl || "/fork_img.png"} alt={eatlist.name} className="card-image" />
                                        <div className="card-info">
                                            <h3 className="card-header" lang={getLang(eatlist.name)} style={{ direction: "rtl", fontWeight: 600 }}>
                                                {eatlist.name}
                                            </h3>
                                            <p className="card-text">{eatlist.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    </>);
};

export default SearchResults;