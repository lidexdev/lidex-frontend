import React, {useEffect, useState} from 'react';
import {NavLink, Link} from 'react-router-dom';

import LogoLidex from './../assets/images/lidexlogo.png';
import LogoWhite from './../assets/images/logo-white.png';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
function Header(){

    /* for sticky header */
	const [headerFix, setheaderFix] = React.useState(false);
	useEffect(() => {
		window.addEventListener("scroll", () => {
			setheaderFix(window.scrollY > 50);
		});
	}, []); 

    const [sidebarOpen, setSidebarOpen] = useState(false);	
    return(
        <>
            <header className="site-header mo-left header header-transparent style-1">
                <div className={`sticky-header main-bar-wraper navbar-expand-lg ${headerFix ? "is-fixed" : ""}`}>
                    <div className="main-bar clearfix">
                        <div className="container clearfix">
                            <div className="logo-header">
                                <Link to={"/"} className="logo-dark"><img src={LogoLidex} alt="" /></Link>
                                <Link to={"/"} className="logo-light"><img src={LogoLidex}  alt="" /></Link>
                            </div>
                            
                            <button  type="button"
                                className={`navbar-toggler  navicon justify-content-end ${sidebarOpen ? 'open' : 'collapsed' }`} 
                                onClick={()=>setSidebarOpen(!sidebarOpen)}
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>         
                                  
                            <div className="extra-nav">
                            <div className="extra-cell config-menu">
                            <a target="_blank" className="fa-solid fa-gear" rel="noreferrer" href="#"></a>
                            </div>
                                <div className="extra-cell">
                                <WalletMultiButton className="btn btn-ghost mr-4" />
                                </div>
                            </div>                           
                                
                            <div className={`header-nav navbar-collapse collapse justify-content-end ${sidebarOpen ? "show" : ""}`} id="navbarNavDropdown" >
                                <div className="logo-header mostion">
                                    <NavLink to={"#"} className="logo-dark"><img src={LogoLidex} alt="" /></NavLink>
                                </div>                            
                                <ul className="nav navbar-nav navbar">
                                    {/* <li><NavLink to={"/"}>Trade</NavLink></li> */}
                                    {/* <li><NavLink to={"/contact-us"}>Contact</NavLink></li>   */}
                                    <li className='d-md-none'><NavLink to={"/contact-us"}>Config</NavLink></li>  
                                </ul>               
                                <div className='side-bar-menu-extra d-md-none'>
                               
                                <div className="extra-cell">
                                    <a className="btn btn-primary btn-gradient btn-shadow" target="_blank" rel="noreferrer" href="#">Connect Wallet</a>
                                </div>
                                </div>
                                <div className="header-bottom">
                                    <div className="dz-social-icon">
                                        <ul>
                                            <li><a target="_blank" className="fab fa-facebook-f" rel="noreferrer" href="https://www.facebook.com/"></a></li>{" "}
                                            <li><a target="_blank" className="fab fa-twitter" rel="noreferrer" href="https://twitter.com/"></a></li>{" "}
                                            <li><a target="_blank" className="fab fa-linkedin-in" rel="noreferrer" href="https://www.linkedin.com/"></a></li>{" "}
                                            <li><a target="_blank" className="fab fa-instagram" rel="noreferrer" href="https://www.instagram.com/"></a></li>
                                        </ul>
                                    </div>	
                                </div>
                                
                            </div>
                            
                        </div>
                    </div>

                </div>
            </header>
        </>
    )
}
export default Header;