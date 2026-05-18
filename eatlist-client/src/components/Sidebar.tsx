import { FunctionComponent, useEffect, useState } from "react";
import "../style/sidebar.css";
import "../style/sidebar-library.css";
import { useNavigate } from "react-router-dom";
import Token from "../interfaces/Token";
import { decodeToken, getUserById } from "../services/UserService";
import Eatlist from "../interfaces/Eatlist";
import { createEatlist, getAllEatlists } from "../services/EatlistService";
import Restaurant from "../interfaces/Restaurant";
import { getAllRestaurants } from "../services/RestaurantService";
import { useSidebar } from "../hooks/useSidebar";
import Swal from "sweetalert2";

interface SidebarProps {
    
}
 
const Sidebar: FunctionComponent<SidebarProps> = () => {
    const navigate = useNavigate();

    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [followedEatlists, setFollowedEatlists] = useState<Eatlist[]>([])
    const [createdEatlists, setCreatedEatlists] = useState<Eatlist[]>([])
    const [likedRestaurants, setLikedRestaurants] = useState<Restaurant[]>([]);
    const [followedCreators, setFollowedCreators] = useState<Record<string, string>>({});
    const [currentUserName, setCurrentUserName] = useState<string>("");
    const [userId, setUserId] = useState<string | null>(null)

    const { isOpen, toggle, close } = useSidebar();

    useEffect(() => {
        const token: Token | null = decodeToken();
        !token ? setIsLoggedIn(false) : setIsLoggedIn(true);
        setIsAdmin(token?.isAdmin || false);
        if (token?._id) {
            setUserId(token._id);
            getUserById(token._id)
                .then((res) => setCurrentUserName(`${res.data.name.first} ${res.data.name.last}`))
                .catch((error) => {
                    console.log(error);
                    Swal.fire({
                        title: "...אופס",
                        text: "משהו השתבש. נסו שוב",
                        icon: "error",
                        confirmButtonText: "חזרה"
                    });
                });
        }

        if (token?._id) {
            getAllEatlists()
                .then((response) => {
                    // find eatlists followed by user
                    const followed = response.data.filter((eatlist: Eatlist) =>
                        eatlist.followers.some((follower) => follower.userId === token._id)
                    );
                    const publicFollowedEatlists = followed.filter((eatlist: Eatlist) => eatlist.isPublic);
                    setFollowedEatlists(publicFollowedEatlists);
                    
                    // fetch creator names for followed eatlists
                    const creatorPromises = followed.map((eatlist: Eatlist) =>
                        getUserById(eatlist.userId).then((res) => ({
                            eatlistId: eatlist._id as string,
                            name: `${res.data.name.first} ${res.data.name.last}`
                        }))
                    );
                    Promise.all(creatorPromises)
                        .then((creators) => {
                            const creatorsMap = creators.reduce((acc, curr) => ({
                                ...acc,
                                [curr.eatlistId]: curr.name
                            }), {} as Record<string, string>);
                            setFollowedCreators(creatorsMap);
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
    
                    // find eatlists created by the user
                    const created = response.data.filter((eatlist: Eatlist) => eatlist.userId === token._id);
                    setCreatedEatlists(created);
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

            getAllRestaurants()
                .then((response) => {
                    // find restaurant liked by the user
                    const liked = response.data.filter((restaurant: Restaurant) => 
                        restaurant.likes.some((like) => like.userId === token._id)
                    );
                    setLikedRestaurants(liked);
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
    }, []);

    useEffect(() => {
        const handleLikeChanged = () => {
            if (!userId) return;
            getAllRestaurants()
                .then((response) => {
                    const liked = response.data.filter((restaurant: Restaurant) =>
                        restaurant.likes.some((like) => like.userId === userId)
                    );
                    setLikedRestaurants(liked);
                })
                .catch((error) => console.log(error));
        };
    
        window.addEventListener("restaurantLikeChanged", handleLikeChanged);
        return () => window.removeEventListener("restaurantLikeChanged", handleLikeChanged);
    }, [userId]);

    useEffect(() => {
        const handleEatlistChanged = () => {
            if (!userId) return;
            getAllEatlists()
                .then((response) => {
                    const created = response.data.filter((eatlist: Eatlist) => eatlist.userId === userId);
                    setCreatedEatlists(created);
    
                    const followed = response.data.filter((eatlist: Eatlist) =>
                        eatlist.followers.some((follower) => follower.userId === userId)
                    );
                    const publicFollowed = followed.filter((eatlist: Eatlist) => eatlist.isPublic);
                    setFollowedEatlists(publicFollowed);
                })
                .catch((error) => console.log(error));
        };
        window.addEventListener("eatlistChanged", handleEatlistChanged);
        return () => window.removeEventListener("eatlistChanged", handleEatlistChanged);
    }, [userId]);

    const handleNavigate = (path: string) => {
        navigate(path);
        close();
    };

    const renderEatlistCard = (eatlist: Eatlist, subtitle: string) => (
        <div key={eatlist.name} className="eatlist-sidebar-card" onClick={() => handleNavigate(`/eatlist/${eatlist._id}`)}>
            <div className="eatlist-card-img">
                <img src={eatlist.imageUrl || "/fork_img.png"} alt={`${eatlist.name} eatlist`} className="liked-restaurants-img" />
            </div>
            <div className="eatlist-sidebar-card-info">
                <h3 className="eatlist-sidebar-card-title">{eatlist.name}</h3>
                <p className="eatlist-sidebar-card-subtitle">{subtitle}</p>
            </div>
        </div>
    );
    
    return (
    <div className={`sidebar ${isOpen ? "sidebar--open" : ""}`} lang="he">
        <div className="sidebar-nav">
            <button className="icon-btn mobile-only sidebar-close-btn" onClick={toggle} style={{margin:0}}>
                <i className="fa-solid fa-bars"></i>
            </button>
            <div className="sidebar-content">
                <img src="/logo_lg_black.png" alt="eatlist logo" className="eatlist-logo-small"/>
                <button className="sidebar-nav-btn" onClick={() => handleNavigate("/")}>
                    <i className="fa-solid fa-house"></i>
                    <span>עמוד הבית</span>
                </button>
                <button className="sidebar-nav-btn" onClick={() => handleNavigate("/about")}>
                    {/* <i className="fa-solid fa-people-roof"></i> */}
                    <i className="fa-solid fa-bullhorn"></i>
                    <span>מה זה <span lang="en">Eatlist</span>?</span>
                </button>
                <button className="sidebar-nav-btn" onClick={() => handleNavigate("/restaurants")}>
                    <i className="fa-solid fa-utensils"></i>
                    <span>כל המסעדות</span>
                </button>
                {isLoggedIn && <>
                    <button className="sidebar-nav-btn" onClick={() => handleNavigate("/eatlists")}>
                        <i className="fa-solid fa-list"></i>
                        <span>כל ה-<span lang="en">Eatlists</span>
                        </span>
                    </button>
                </>}
                <hr className="divider-thin"/>
                {!isLoggedIn && <>
                <button className="sidebar-nav-btn" style={{paddingBottom:"16px"}} onClick={() => handleNavigate("/login")}>
                    <i className="fa-solid fa-circle-user"></i>
                    <span>התחברות</span>
                </button>
                </>}
                {isAdmin && <>
                <button className="sidebar-nav-btn" onClick={() => handleNavigate("/restaurant-management")}>
                    <i className="fa-solid fa-shop"></i>
                    <span>ניהול מסעדות</span>  
                </button>
                <button className="sidebar-nav-btn" onClick={() => handleNavigate("/user-management")}>
                    <i className="fa-solid fa-people-group"></i>
                    <span>ניהול משתמשים</span>  
                </button>
                <hr className="divider-thin"/>
                </>}
            </div>
        </div>
        <div className="library-header">
            <div className="library-top">
                <div>
                    <i className="fa-solid fa-lines-leaning"></i>
                    <span className="library-top-title">הספרייה</span>
                </div>
                {isLoggedIn &&
                    <button className="add-btn" onClick={() => {
                        createEatlist({name: `ה-Eatlist שלי #${createdEatlists.length + 1}`, imageUrl: "", description: "", isPublic: false})
                            .then((response) => {
                                navigate(`/eatlist/${response.data._id}`);
                                window.dispatchEvent(new CustomEvent("eatlistChanged"));
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
                        <i className="fa-solid fa-plus"></i>
                    </button>
                }
            </div>
        </div>
        <div className="library">
            {!isLoggedIn &&
                <p className="eatlist-sidebar-card-subtitle">יש להתחבר כדי לצפות בספרייה</p>
            }
            {isLoggedIn && <>
                <div className="eatlist-sidebar-list">
                    <div key="likedRestaurants" className="eatlist-sidebar-card" onClick={() => handleNavigate("/liked-restaurants")}>
                        <div className="eatlist-card-img">
                            <div className="liked-restaurants-img">
                                <i className="fa-solid fa-heart"></i>
                            </div>
                        </div>
                        <div className="eatlist-sidebar-card-info">
                            <h3 className="eatlist-sidebar-card-title">מסעדות שאהבתי</h3>
                            <p className="eatlist-sidebar-card-subtitle">{likedRestaurants.length || 0} מסעדות</p>
                        </div>
                    </div>
                    {(createdEatlists.length > 0) && <>
                        {createdEatlists.map(eatlist => renderEatlistCard(eatlist, `${currentUserName}`))}
                        <hr className="divider-thin" style={{margin: "4px 16px"}} />
                    </>
                    }
                    {followedEatlists.map(eatlist => renderEatlistCard(eatlist, followedCreators[eatlist._id as string] || ""))}

                    {!createdEatlists.length && !followedEatlists.length && (
                        <p className="note-text">כאן יוצגו Eatlists שיצרת או עקבת אחריהן</p>
                    )}
                </div>
            </>}
        </div>
    </div>
    );
}
 
export default Sidebar;