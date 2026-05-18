import { useEffect, useState } from "react";
import Eatlist from "../interfaces/Eatlist";
import User from "../interfaces/User";
import { getUserById } from "../services/UserService";
import { Link } from "react-router-dom";

interface EatlistCardProps {
    eatlist: Eatlist;
}

const EatlistCard = ({ eatlist }: EatlistCardProps) => {
    const [user, setUser] = useState<User>();

    useEffect (() => {
        getUserById(eatlist.userId)
            .then((response) => setUser(response.data))
            .catch((error) => console.log(error))
    }, []);

    // detect if h3 is in Hebrew or English for font assignment
    const getLang = (text: string) => {
        // Regex for Hebrew Unicode range
        const hebrewPattern = /[\u0590-\u05FF]/;
        return hebrewPattern.test(text) ? "he" : "en";
    };

    return (
        <Link to={`/eatlist/${eatlist._id}`} className="single-card">
            <div className="single-card" lang="he">
                <img src={eatlist.imageUrl || "/fork_img.png"} alt={`${eatlist.name} eatlist`} className="card-image"/>
                <p className="card-tag-ice">{eatlist.followers.length} עוקבים</p>
                <div className="card-info">
                    <h3 className="card-header" lang={getLang(eatlist.name)} style={{direction: "rtl", fontWeight: 600}}>
                        {eatlist.name}
                    </h3>
                    <p className="card-text">
                        {user?.name.first} {user?.name.last}
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default EatlistCard;