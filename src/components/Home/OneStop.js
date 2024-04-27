import React from 'react';

//Images
import Icon9 from './../../assets/images/icons/icon9.svg';
import Icon10 from './../../assets/images/icons/icon10.svg';
import Icon11 from './../../assets/images/icons/icon11.svg';
import Icon12 from './../../assets/images/icons/icon12.svg';
import Icon13 from './../../assets/images/icons/icon13.svg';

const cardData = [
    {image: Icon9, title:'Efficient Token Management',description:'Discover the ease of managing your tokens seamlessly, ensuring swift transactions and hassle-free operations'},
    {image: Icon10, title:'Instantaneous Swaps',description:'Experience lightning-fast token swaps that occur in the blink of an eye, providing instant liquidity and flexibility'},
    {image: Icon11, title:'User-Friendly Interface',description:'Navigate effortlessly through our platform\'s intuitive interface designed to provide a smooth and enjoyable trading experience for all users'},
    {image: Icon12, title:'High-Speed Transactions',description:'Benefit from rapid transaction processing, enabling quick and efficient token trades without delays or interruptions'},
    {image: Icon13, title:'Optimized Network Performance',description:'Enjoy uninterrupted trading with our optimized network performance, ensuring reliable connectivity and minimal downtime'},
    {image: Icon9, title:'Smooth Transaction Processing',description:'Experience seamless transaction processing with our platform\'s advanced technology, guaranteeing swift and secure transfers every time'},
];

function OneStop(){
    return(
        <>
            {cardData.map((item, ind)=>(
                <div className="col-xl-4 col-md-6 m-b60" key={ind}>
                    <div className="icon-bx-wraper style-3 text-center">
                        <div className="icon-media">
                            <img src={item.image} alt="" />
                        </div>
                        <div className="icon-content">
                            <h4 className="title">{item.title}</h4>
                            <p className="m-b0">{item.description}</p>
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}
export default OneStop;