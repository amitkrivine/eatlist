import { FunctionComponent, useEffect, useState } from "react";
import User from "../interfaces/User";
import { decodeToken, getUserById } from "../services/UserService";
import Swal from "sweetalert2";
import "../style/global-assets.css";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
import Footer from "./Footer";

interface ProfileProps {
    
}
 
const Profile: FunctionComponent<ProfileProps> = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    const [user, setUser] = useState<User>();
    
    const navigate = useNavigate();
    const userToken = decodeToken();

    useEffect(() => {
        getUserById(userToken?._id as string)
        .then((response) => {
            setUser(response.data);
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
            });
        });
    },[]);

    return (<>
    <Navbar/>
    <Sidebar/>
    {isLoading ? (<>
        <div className="container">
            <Loader />
        </div>
    </>) : (<>
        <main className="container" lang="he">
            <div className="page-content">
                <img src="https://cdn.dribbble.com/userupload/31776407/file/original-9912ad5f5772dc1e836e97350967fa3f.jpg" alt="eatlist" className="image-overlay"/>
                <div className="profile-container z-index-front">
                    {user?.imageUrl &&
                        <img src={user?.imageUrl || "https://i.pinimg.com/736x/9e/83/75/9e837528f01cf3f42119c5aeeed1b336.jpg"} alt={`${user?.name.first} ${user?.name.last}` || "eatlist user"} className="image-large"/>
                    }
                    <h2 className="section-header-text extra-spacing centered">פרופיל משתמש</h2>
                    <div className="profile-info">
                        <p><span className="rubik-bold">{user?.name.first} {user?.name.last}</span></p>
                        {user?.address.street && (
                        <p>{user?.address.street} {user?.address.houseNumber}, {user?.address.city}</p>
                        )}
                        <div>
                            <p>{user?.phone}</p>
                            <p>{user?.email}</p>
                        </div>
                        <button className="btn-secondary" onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/login");
                        }}>לא {user?.name.first}? לחצו להחלפת משתמש</button>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    </>)}
    </>);
}
 
export default Profile;