import CustomLink from "./CustomLink";
import {Link} from "react-router-dom";

export default function Navbar(){
    return <nav className="nav">
        <Link to="/" className="site-title">
            NutriHub
        </Link>
        <ul>
            <CustomLink to="/admin">Admin</CustomLink>
            <CustomLink to="/services">Services</CustomLink>
            <CustomLink to="/about">About</CustomLink>
        </ul>
    </nav>
}

