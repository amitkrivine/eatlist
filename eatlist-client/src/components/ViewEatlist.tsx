import { FunctionComponent, useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Eatlist from "../interfaces/Eatlist";
import User from "../interfaces/User";
import { deleteEatlist, followEatlist, getEatlistById, updateEatlist } from "../services/EatlistService";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { decodeToken, getUserById } from "../services/UserService";
import Swal from "sweetalert2";
import "../style/eatlist.css";
import "../style/sidebar.css";
import Token from "../interfaces/Token";
import { likeRestaurant } from "../services/RestaurantService";
import Loader from "./Loader";

interface ViewEatlistProps {
    
}
 
const ViewEatlist: FunctionComponent<ViewEatlistProps> = () => {
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [eatlist, setEatlist] = useState<Eatlist>();
    const [user, setUser] = useState<User>();
    const [eatlistByUser, setEatlistByUser] = useState<boolean>(false);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [likedRestaurantIds, setLikedRestaurantIds] = useState<Set<string>>(new Set());
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [openRowDropdown, setOpenRowDropdown] = useState<string | null>(null);
    const [dropdownDirection, setDropdownDirection] = useState<"down" | "up">("down");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        getEatlistById(id as string)
            .then((response) => {
                setEatlist(response.data);
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
    }, [id, location.state] );

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
                    });
                }
            );

            const token: Token | null = decodeToken();
            if (token) {
                setIsLoggedIn(true);
                setIsLoading(false);
            } else {
                setIsLoggedIn(false);
                setIsLoading(false);
            }

            if (token?._id && eatlist?.userId === token._id) {
                setEatlistByUser(true);
            } else {
                setEatlistByUser(false);
            };

            if (token?._id && eatlist) {
                const liked = new Set(
                    eatlist.restaurants
                        .filter((r) => r.likes?.some((like) => like.userId === token._id))
                        .map((r) => r._id as string)
                );
                setLikedRestaurantIds(liked);
            };

            if (token?._id && eatlist?.followers.some((follower) => follower.userId?.toString() === token._id?.toString())) {
                setIsFollowing(true);
            } else {
                setIsFollowing(false);
            }
        };
    }, [eatlist]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleRowDropdownToggle = (e: React.MouseEvent<HTMLButtonElement>, restaurantId: string) => {
        if (openRowDropdown === restaurantId) {
            setOpenRowDropdown(null);
            return;
        }
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 200; // approximate height of your dropdown in px
        setDropdownDirection(spaceBelow < dropdownHeight ? "up" : "down");
        setOpenRowDropdown(restaurantId);
    };

    const handleDeleteEatlist = () => {
        setDropdownOpen(false);
        Swal.fire({
            title: "מחיקה",
            text: "בטוח? פעולה זו אינה ניתנת לביטול",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "מחיקה",
            cancelButtonText: "ביטול",
            confirmButtonColor: "#d33",
        }).then((response) => {
            if (response.isConfirmed) {
                deleteEatlist(eatlist?._id as string)
                    .then(() => {
                        Swal.fire({
                            title: "מחיקה בוצעה",
                            html: "המחיקה בוצעה בהצלחה",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false,
                        })
                            .then(() => navigate("/"))
                            .catch((error) => console.log(error));
                    })
                    .catch((error) => {
                        console.log(error)
                        Swal.fire({
                            icon: "error",
                            title: "...אופס",
                            text: "משהו השתבש. נסו שוב",
                            confirmButtonText: "חזרה"
                        })
                    })
            }
        });
    };

    // handle moving a restaurant up or down the eatlist's rank
    const handleMoveRestaurant = (index: number, direction: "up" | "down") => {
        setOpenRowDropdown(null);
        if (!eatlist) return;
        const restaurants = [...eatlist.restaurants];
        const swapIndex = direction === "up" ? index - 1 : index + 1;

        [restaurants[index], restaurants[swapIndex]] = [restaurants[swapIndex], restaurants[index]];

        const reranked = restaurants.map((r, i) => ({ ...r, rank: i }));
    
        setEatlist({ ...eatlist, restaurants: reranked });
    
        updateEatlist(eatlist._id as string, { ...eatlist, restaurants: reranked })
            .catch((error) => {
                console.log(error);
                setEatlist(eatlist);
                Swal.fire({
                    title: "...אופס",
                    text: "משהו השתבש. נסו שוב",
                    icon: "error",
                    confirmButtonText: "חזרה"
                });
            });
    };

    const handleRemoveRestaurant = (restaurantId: string) => {
        setOpenRowDropdown(null);
        if (!eatlist) return;
        const updated = {
            ...eatlist,
            restaurants: eatlist.restaurants.filter((r) => r._id !== restaurantId)
        };
        setEatlist(updated);
        updateEatlist(eatlist._id as string, updated)
            .catch((error) => {
                console.log(error);
                setEatlist(eatlist);
                Swal.fire({
                    title: "...אופס",
                    text: "משהו השתבש. נסו שוב",
                    icon: "error",
                    confirmButtonText: "חזרה"
                });
            });
    };

    const handleFollow = () => {
        followEatlist(eatlist?._id as string)
            .then(() => {
                window.dispatchEvent(new CustomEvent("eatlistChanged"));
                setIsFollowing(!isFollowing);
                setEatlist((prev) => {
                    if (!prev) return prev;
                    if (isFollowing) {
                        // unfollow action
                        return {
                            ...prev,
                            followers: prev.followers.filter((f) => f.userId !== decodeToken()?._id)
                        };
                    } else {
                        // follow action
                        return {
                            ...prev,
                            followers: [...prev.followers, { userId: decodeToken()?._id as string }]
                        };
                    }
                });
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

    const handlePublicToggle = () => {
        setDropdownOpen(false);
        if (!eatlist) return;
        const updated = { ...eatlist, isPublic: !eatlist.isPublic };
        setEatlist(updated);
        updateEatlist(eatlist._id as string, updated)
            .catch((error) => {
                console.log(error);
                setEatlist(eatlist);
                Swal.fire({
                    title: "...אופס",
                    text: "משהו השתבש. נסו שוב",
                    icon: "error",
                    confirmButtonText: "חזרה"
                });
            });
    };
    
    // detect if eatlist name is in Hebrew or English for font assignment
    const getLang = (text: string) => {
        const hebrewPattern = /[\u0590-\u05FF]/;
        return hebrewPattern.test(text) ? "he" : "en";
    };

    return (<>
    <Navbar/>
    <Sidebar/>
    {isLoading ? (<>
        <div className="container-home">
            <Loader />
        </div>
    </>) : (<>
    {isLoggedIn ? (
        <div className="eatlist-container" lang="he">
            <div className="eatlist-header">
                <img src={eatlist?.imageUrl || "/fork_img.png"} alt={`${eatlist?.name} eatlist`} className="eatlist-image" />
                <div className="header-content">
                    {eatlist?.isPublic ? <p className="eatlist-status"><span lang="en">Eatlist</span> פומבי</p> : <p className="eatlist-status"><span lang="en">Eatlist</span> פרטי</p>}
                    <h2 className="eatlist-name" lang={getLang(eatlist?.name as string)}>{eatlist?.name}</h2>
                    <p className="eatlist-description">{eatlist?.description}</p>
                    <div className="eatlist-stats">
                        <div className="eatlist-user">
                            <img src={user?.imageUrl || "https://i.pinimg.com/736x/9e/83/75/9e837528f01cf3f42119c5aeeed1b336.jpg"} alt={`${user?.name.first} ${user?.name.last}` || "eatlist user"} className="user-image" />
                            <p className="username">{user?.name.first} {user?.name.last}</p>
                        </div>
                        <p className="dots">·</p>
                        <p className="stats-text">{eatlist?.restaurants.length} מסעדות</p>
                        <p className="dots">·</p>
                        <p className="stats-text">{eatlist?.followers.length} עוקבים</p>
                    </div>
                </div>
            </div>
            <div className="eatlist-action-bar hidden-on-small-mobile">
                {eatlistByUser && <>
                    <button className="btn-primary">
                        <Link to={`/eatlist/${eatlist?._id}/add-restaurants`} state={{ background: location }} className="filter-btn-link">
                                <i className="fa-solid fa-plus"></i> הוספה
                        </Link>
                    </button>
                    <button className="btn-tertiary">
                        <Link to={`/eatlist/${eatlist?._id}/edit`} state={{ background: location }} className="filter-btn-link">
                                <i className="fa-solid fa-pen-to-square"></i> עריכה
                        </Link>
                    </button>
                </>}
                {!eatlistByUser && <>
                        {isFollowing ? (
                            <button className="btn-primary" onClick={handleFollow}><span><i className="fa-solid fa-user-minus"></i></span> להסיר עוקב?</button>
                        ) : (
                            <button className="btn-primary" onClick={handleFollow}><span><i className="fa-solid fa-user-plus"></i></span> לעקוב?</button>
                        )}
                </>}
                <button className="btn-tertiary" onClick={() => 
                    Swal.fire({
                        title: "!אופס",
                        imageUrl: "https://img.magnific.com/free-vector/construction-tools_24877-63504.jpg?semt=ais_hybrid&w=740&q=80",
                        imageWidth: 400,
                        imageHeight: 380,
                        imageAlt: "Custom image",
                        text: "מתנצלים, חלק זה של האתר עוד בעבודה",
                        showConfirmButton: true,
                        confirmButtonText: "אוקיי"
                    })
                    }><i className="fa-solid fa-share-nodes"></i> שיתוף
                </button>
                {eatlistByUser && (
                    <div className="dropdown-wrapper" ref={dropdownRef}>
                        <button className="btn-tertiary" onClick={() => setDropdownOpen((prev) => !prev)} aria-haspopup="true" aria-expanded={dropdownOpen}>
                            <i className="fa-solid fa-ellipsis"></i>
                        </button>
                        {dropdownOpen && (
                            <div className="dropdown-menu">
                                <button className="dropdown-item" onClick={handlePublicToggle}>
                                    <i className={`fa-solid ${eatlist?.isPublic ? "fa-lock" : "fa-globe"}`}></i>
                                    <span>
                                        {eatlist?.isPublic ? "הפיכת Eatlist לפרטי" : "הפיכת Eatlist לפומבי"}
                                    </span>
                                </button>
                                <div className="dropdown-divider" />
                                <button className="dropdown-item dropdown-item--danger" onClick={handleDeleteEatlist}>
                                    <i className="fa-solid fa-trash"></i>
                                    <span>
                                        מחיקה
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="eatlist-action-bar only-on-small-mobile">
                <div className="dropdown-wrapper" ref={dropdownRef}>
                    <button className="btn-tertiary" onClick={() => setDropdownOpen((prev) => !prev)} aria-haspopup="true" aria-expanded={dropdownOpen}>
                        <i className="fa-solid fa-ellipsis"></i>
                    </button>
                    {dropdownOpen && (
                        <div className="dropdown-menu menu-alignment">
                            {!eatlistByUser ? (<>
                                {isFollowing ? (
                                    <button className="dropdown-item" onClick={handleFollow}><span><i className="fa-solid fa-user-minus"></i></span> להסיר עוקב?</button>
                                ) : (
                                    <button className="dropdown-item" onClick={handleFollow}><span><i className="fa-solid fa-user-plus"></i></span> לעקוב?</button>
                                )}
                            </>) : (<>
                                <button className="dropdown-item">
                                    <Link to={`/eatlist/${eatlist?._id}/add-restaurants`} state={{ background: location }} className="filter-btn-link">
                                            <i className="fa-solid fa-plus"></i> הוספה
                                    </Link>
                                </button>
                                <button className="dropdown-item">
                                    <Link to={`/eatlist/${eatlist?._id}/edit`} state={{ background: location }} className="filter-btn-link">
                                            <i className="fa-solid fa-pen-to-square"></i> עריכה
                                    </Link>
                                </button>
                                <button className="dropdown-item" onClick={handlePublicToggle}>
                                    <i className={`fa-solid ${eatlist?.isPublic ? "fa-lock" : "fa-globe"}`}></i>
                                    <span>
                                        {eatlist?.isPublic ? "הפיכת Eatlist לפרטי" : "הפיכת Eatlist לפומבי"}
                                    </span>
                                </button>
                                <div className="dropdown-divider" />
                                <button className="dropdown-item dropdown-item--danger" onClick={handleDeleteEatlist}>
                                    <i className="fa-solid fa-trash"></i>
                                    <span>
                                        מחיקה
                                    </span>
                                </button>
                            </>)}
                            <button className="dropdown-item" onClick={() => 
                                Swal.fire({
                                    title: "!אופס",
                                    imageUrl: "https://img.magnific.com/free-vector/construction-tools_24877-63504.jpg?semt=ais_hybrid&w=740&q=80",
                                    imageWidth: 400,
                                    imageHeight: 380,
                                    imageAlt: "Custom image",
                                    text: "מתנצלים, חלק זה של האתר עוד בעבודה",
                                    showConfirmButton: true,
                                    confirmButtonText: "אוקיי"
                                })
                                }><i className="fa-solid fa-share-nodes"></i> שיתוף
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <table className="eatlist-restaurants-table">
                <thead>
                    <tr>
                        <th className="desktop-only">#</th>
                        <th></th>
                        <th>שם</th>
                        <th>סוג</th>
                        <th className="desktop-only">כתובת</th>
                        <th className="desktop-only">תאריך הוספה</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {eatlist?.restaurants.map((restaurant, index) => (
                        <tr key={restaurant._id}>
                            <td className="desktop-only">{index + 1}</td>
                            <td className="hidden-on-small-mobile">
                                <img src={restaurant.imageUrl} alt={restaurant.name.main} className="eatlist-restaurant-image" />
                            </td>
                            <td className="name-and-note-cell">
                                <div lang={getLang(restaurant.name.main as string)} className="eatlist-restaurant-name" style={!restaurant.userNote ? ({marginTop:"8px"}) : ({margin:0})}>
                                    {restaurant.name.main}
                                </div>
                                {restaurant.userNote && (
                                    <div className="eatlist-restaurant-comment">
                                        <span><i className="fa-solid fa-comment-dots"></i></span> {restaurant.userNote}
                                    </div>
                                )}
                            </td>
                            <td className="table-text padding12">{restaurant.genre}</td>
                            <td className="table-text desktop-only">{restaurant.address.street} {restaurant.address.houseNumber}, {restaurant.address.city}</td>
                            <td className="table-text desktop-only">{new Date(restaurant.dateAdded).toLocaleDateString("he-IL")}</td>
                            <td className="padding12">
                                <i className="fa-solid fa-heart"
                                    style={{ color: likedRestaurantIds.has(restaurant._id as string) ? "#DB3A34" : "#999", cursor: "pointer" }}
                                    onClick={() => {
                                        likeRestaurant(restaurant.restaurantId as string)
                                            .then(() => {
                                                setLikedRestaurantIds((prev) => {
                                                    const updated = new Set(prev);
                                                    if (updated.has(restaurant._id as string)) {
                                                        updated.delete(restaurant._id as string);
                                                    } else {
                                                        updated.add(restaurant._id as string);
                                                    }
                                                    return updated;
                                                });
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
                                    }}
                                ></i>
                            </td>
                            <td>
                                <div className="dropdown-wrapper">
                                <button className="icon-btn" onClick={(e) => handleRowDropdownToggle(e, restaurant._id as string)}>
                                    <i className="fa-solid fa-ellipsis"></i>
                                </button>
                                    {openRowDropdown === restaurant._id && (
                                        <div className={`dropdown-menu eatlist-restaurant-menu ${dropdownDirection === "up" ? "dropdown-menu--up" : ""}`}>
                                            <button className="dropdown-item">
                                                <Link to={`/restaurants/${restaurant.restaurantId}`} state={{ background: location }} className="filter-btn-link" onClick={() => setOpenRowDropdown(null)}>
                                                    <i className="fa-solid fa-circle-info"></i> פרטי המסעדה
                                                </Link>
                                            </button>
                                            <button className="dropdown-item">
                                                <i className="fa-solid fa-plus"></i> הוספה לרשימה
                                            </button>
                                            {eatlistByUser && (<>
                                                <hr className="divider-thin" style={{margin: "4px 16px"}} />
                                                {index > 0 && (
                                                    <button className="dropdown-item" onClick={() => handleMoveRestaurant(index, "up")}>
                                                        <i className="fa-solid fa-arrow-up"></i> הזזה למעלה
                                                    </button>
                                                )}
                                                {index < eatlist.restaurants.length - 1 && (<>
                                                    <button className="dropdown-item" onClick={() => handleMoveRestaurant(index, "down")}>
                                                        <i className="fa-solid fa-arrow-down"></i> הזזה למטה
                                                    </button>
                                                </>)}
                                                <hr className="divider-thin" style={{margin: "4px 16px"}} />
                                            </>)}
                                            {eatlistByUser && (<>
                                                <div>
                                                    <button className="dropdown-item">
                                                        <Link to={`/eatlist/${eatlist?._id}/edit-note/${restaurant._id}`} state={{ background: location }} className="filter-btn-link" onClick={() => setOpenRowDropdown(null)}>
                                                            <i className="fa-solid fa-comment-dots"></i>
                                                            {!restaurant.userNote && (
                                                                <span>הוספת הערה</span>
                                                            )}
                                                            {restaurant.userNote && (
                                                                <span>עריכת הערה</span>
                                                            )}
                                                        </Link>
                                                    </button>
                                                    <button className="dropdown-item text-danger" onClick={() => handleRemoveRestaurant(restaurant._id as string)}>
                                                        <i className="fa-solid fa-trash"></i> הסרה מה-Eatlist
                                                    </button>
                                                </div>
                                            </>)}
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (
        <div className="container" lang="he">
            <img src="https://cdn.dribbble.com/userupload/31776407/file/original-9912ad5f5772dc1e836e97350967fa3f.jpg" alt="eatlist" className="banner-overlay"/>
            <div className="container-content z-index-front">
                <div>
                    <p className="">יש להתחבר לחשבון כדי לצפות בעמוד זה</p>
                </div>
            </div>
        </div>
    )}
    </>)}
    </>);
}
 
export default ViewEatlist;