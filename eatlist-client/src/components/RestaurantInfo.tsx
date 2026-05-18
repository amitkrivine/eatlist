import { FunctionComponent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteRestaurant, getRestaurantById, likeRestaurant } from "../services/RestaurantService";
import Restaurant from "../interfaces/Restaurant";
import { decodeToken } from "../services/UserService";
import HoverBadge from './HoverBadge';
import { addRestaurantToEatlist } from "../services/EatlistService";
import Token from "../interfaces/Token";
import EatlistPicker from "./EatlistPicker";
import Loader from "./Loader";
import Swal from "sweetalert2";

interface RestaurantInfoProps {
    
}
 
const RestaurantInfo: FunctionComponent<RestaurantInfoProps> = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [restaurant, setRestaurant] = useState<Restaurant>();
    const [isLiked, setIsLiked] = useState<boolean>(false);

    const [showEatlistPicker, setShowEatlistPicker] = useState<boolean>(false);
    
    useEffect(() => {
        getRestaurantById(id as string)
            .then((response) => {
                setRestaurant(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
                Swal.fire({
                    title: "...אופס",
                    text: "משהו השתבש בהצגת המידע. נסו שוב",
                    icon: "error",
                    confirmButtonText: "חזרה"
                });
            });

        const token: Token | null = decodeToken();
        !token ? setIsLoggedIn(false) : setIsLoggedIn(true);
        setIsAdmin(token?.isAdmin || false);
    }, []);
    
    useEffect(() => {
        if (restaurant) {
            const token = decodeToken();
            setIsLiked(restaurant.likes.findIndex((like) => like.userId === token?._id) !== -1);
        }
    }, [restaurant]);

    // detect if h3 is in Hebrew or English for font assignment
    const getLang = (text: string) => {
        // Regex for Hebrew Unicode range
        const hebrewPattern = /[\u0590-\u05FF]/;
        return hebrewPattern.test(text) ? "he" : "en";
    };

    const handleDelete = (restaurantId : string) => {
        deleteRestaurant(restaurantId)
            .then(() => {
                window.dispatchEvent(new CustomEvent("restaurantChanged"));
                Swal.fire({
                    title: "מחיקה בוצעה",
                    text: "המסעדה נמחקה בהצלחה",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                })
                    .then(() => navigate(-1))
                    .catch((error) => {
                        console.log(error);
                        Swal.fire({
                            title: "...אופס",
                            text: "משהו השתבש. נסו שוב",
                            icon: "error",
                            confirmButtonText: "חזרה"
                        });
                    });
            })
            .catch((error) => {
                console.log(error);
                Swal.fire({
                    icon: "error",
                        title: "...אופס",
                        text: "אירעה שגיאה. נסו שוב",
                        confirmButtonText: "חזרה"
                })
            })
    }

    
    return (<>
    {isLoading ? (<>
        <div className="modal-container">
            <Loader />
        </div>
    </>) : (<>
        {restaurant ? (
            <div className="modal-container" lang="he">
                <div className="modal-header-img-container">
                    <img src={restaurant.imageUrl || "https://img.magnific.com/free-vector/shopping-store-icon-isolated-illustration_18591-82228.jpg?semt=ais_hybrid&w=740&q=80"} alt={restaurant.name.main} className="modal-header-img"/>
                    <p className="genre-tag">{restaurant.genre}</p>
                </div>
                <div className="modal-header">
                    <h2 className="modal-restaurant-name" lang={getLang(restaurant.name.main)}>{restaurant?.name.main}</h2>
                    <div className="modal-header-icons">
                        {isLoggedIn && (<>
                            {isAdmin && (<>
                                <HoverBadge badgeContent={
                                    <div className="header-icon" onClick={() => handleDelete(restaurant._id as string)}>
                                        <i className="fa-solid fa-trash-can"></i>
                                    </div>
                                } hoverText="מחיקת מסעדה" />
                            </>)}
                            <HoverBadge badgeContent={
                                <div className="header-icon" onClick={() => setShowEatlistPicker(true)}>
                                    <i className="fa-solid fa-list"></i>
                                </div>
                            } hoverText="הוספה ל-Eatlist" />
                            <HoverBadge badgeContent={
                                <div className="header-icon" onClick={() => {
                                    likeRestaurant(restaurant._id as string)
                                        .then(() => {
                                            setIsLiked(!isLiked);
                                            window.dispatchEvent(new CustomEvent("restaurantLikeChanged"));
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
                                }}>
                                    <i className="fa-solid fa-heart" style={{color:`${isLiked ? ("#DB3A34") : ("#999")}`}}></i> 
                                </div>
                            } hoverText="סימון ׳אהבתי׳" />
                        </>)}
                    </div>
                </div>
                <p className="modal-text">{restaurant.description}</p>
                <div className="info-text-wrapper">
                    <div className="info-icon-text">
                        <i className="fa-solid fa-location-dot"></i>
                        <p>{restaurant.address.street} {restaurant.address.houseNumber}, {restaurant.address.city}</p>
                    </div>
                    {restaurant.phone && (
                        <div className="info-icon-text">
                            <i className="fa-solid fa-phone-flip"></i>
                            <p>{restaurant.phone}</p>
                        </div>
                    )}
                </div>
                {(restaurant.urls.website || restaurant.urls.menu || restaurant.urls.instagram || restaurant.urls.reservations) ? (    
                    <div className="icon-text-wrapper">
                        {restaurant.urls.reservations && (
                            <a href={restaurant.urls.reservations as string} className="icon-text-btn" target="_blank" rel="noreferrer">
                                <i className="fa-solid fa-calendar-day"></i>
                                <p>הזמנת מקום</p>
                            </a>
                        )}
                        {restaurant.urls.website && (
                            <a href={restaurant.urls.website as string} className="icon-text-btn" target="_blank" rel="noreferrer">
                                <i className="fa-solid fa-earth-americas"></i>
                                <p>אתר הבית</p>
                            </a>
                        )}
                        {restaurant.urls.menu && (
                            <a href={restaurant.urls.menu as string} className="icon-text-btn" target="_blank" rel="noreferrer">
                                <i className="fa-solid fa-utensils"></i>
                                <p>תפריט</p>
                            </a>
                        )}
                        {restaurant.urls.instagram && (
                            <a href={restaurant.urls.instagram as string} className="icon-text-btn" target="_blank" rel="noreferrer">
                                <i className="fa-solid fa-camera-retro"></i>
                                <p lang="en">Instagram</p>
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="extra-spacing"></div>
                )}
                {showEatlistPicker && (
                    <EatlistPicker restaurantId={restaurant._id as string} onClose={() => setShowEatlistPicker(false)}/>
                )}
            </div>
        ) : (
            <p>המסעדה לא נמצאה במאגר</p>
        )}
    </>)}
    </>);
}
 
export default RestaurantInfo;