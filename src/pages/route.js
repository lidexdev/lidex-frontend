import React from 'react';
import { BrowserRouter, Route, Routes  } from 'react-router-dom';

import ScrollToTop from './../layouts/ScrollToTop';
import Header from './../layouts/Header';
import Home from './Home';

function Index(){
	return(
		<BrowserRouter basename="">
			<div className="page-wraper">
					<Header />
					<Routes>
						<Route path='/' exact element={<Home />} />
					</Routes>
					
				<ScrollToTop />
			</div>
		 </BrowserRouter>			
	)
} 
export default Index;