import Restaurant from "../interfaces/Restaurant";
import { Link, useLocation } from "react-router-dom";

interface RestaurantCardProps {
    restaurant: Restaurant;
}

const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
    // detect if h3 is in Hebrew or English for font assignment
    const getLang = (text: string) => {
        // Regex for Hebrew Unicode range
        const hebrewPattern = /[\u0590-\u05FF]/;
        return hebrewPattern.test(text) ? "he" : "en";
    };

    const location = useLocation();

    return (
        <Link to={`/restaurants/${restaurant._id}`} state={{ background: location }} className="single-card">
            <div className="single-card" lang="he">
                <div>
                    <img src={restaurant.imageUrl || "https://img.magnific.com/free-vector/shopping-store-icon-isolated-illustration_18591-82228.jpg?semt=ais_hybrid&w=740&q=80"} alt={restaurant.name.main} className="card-image"/>
                    <p className="card-tag">{restaurant.genre}</p>
                </div>
                <div className="card-info">
                    <h3 className="card-header" lang={getLang(restaurant.name.main)} style={{direction:"rtl", fontWeight:600}}>
                        {restaurant.name.main}
                    </h3>
                    <p className="card-text">
                        {restaurant.address.street} {restaurant.address.houseNumber}, {restaurant.address.city}
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default RestaurantCard;