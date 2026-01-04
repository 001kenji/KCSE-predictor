import React, { useState,useRef } from "react";
import { connect,  } from "react-redux";
import { FaWhatsapp } from "react-icons/fa";
import emailjs from '@emailjs/browser';
import { AiOutlineMail } from "react-icons/ai";
const ContactMe = () =>{
    const [showContact, setShowContact] = useState(false)
    const form = useRef();
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSending(true);
    setSendStatus(null);

    emailjs.sendForm(
      import.meta.env.VITE_EMAILJS_SERVICE_ID, // Replace with your EmailJS service ID
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID, // Replace with your EmailJS template ID
      form.current,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY // Replace with your EmailJS public key
    )
    .then((result) => {
      console.log(result.text);
      setSendStatus('success');
      form.current.reset();
    }, (error) => {
      console.log(error.text);
      setSendStatus('error');
    })
    .finally(() => {
      setIsSending(false);
    });
  };
   
    return (
       
        <div id="Contact-Container" className="px-4 py-12 text-black dark:text-white md:py-16 w-full max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h2 
                data-aos="flip-left" 
                data-aos-easing="ease-in-sine" 
                data-aos-duration="1500" 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-white flex items-center justify-center"
                >
                <span className="inline-block w-2 h-2 md:w-3 md:h-3 rounded-full bg-sky-500 mr-3 animate-pulse"></span>
                Contact Me
                </h2>
                
                <p className="mt-6 text-lg md:text-xl text-slate-800   dark:text-slate-300 max-w-2xl mx-auto">
                I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="bg-transparent shadow-xs dark:shadow-none shadow-slate-400 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 dark:border dark:border-slate-700/50">
                <h3 className="text-2xl font-semibold text-black dark:text-white mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Information
                </h3>
                
                <ul className="space-y-4">
                    <li className="flex items-start">
                    <svg className="w-5 h-5 mt-1 mr-3 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                        <h4 className="font-medium  text-black dark:text-slate-300">Phone</h4>
                        <a href="tel:+254723700284" className="text-slate-800 dark:text-slate-400 hover:text-sky-400 transition">+254 723 700 284</a>
                    </div>
                    </li>
                    
                    <li className="flex items-start">
                    <svg className="w-5 h-5 mt-1 mr-3 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                        <h4 className="font-medium  text-black dark:text-slate-300">Email</h4>
                        <a href="mailto:briannjuguna694@gmail.com" className="text-slate-800 dark:text-slate-400 hover:text-sky-400 transition">briannjuguna694@gmail.com</a>
                    </div>
                    </li>
                    
                    <li className="flex items-start">
                    <svg className="w-5 h-5 mt-1 mr-3 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                        <h4 className="font-medium  text-black dark:text-slate-300">Location</h4>
                        <p className="text-slate-800 dark:text-slate-400">Nairobi, Kenya</p>
                    </div>
                    </li>
                </ul>
                
                <div className="mt-8">
                    <h4 className="text-lg font-medium text-black dark:text-white mb-4">Connect with me</h4>
                    <div className="flex space-x-4">
                    <a href="https://m.me/61554162522919" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center hover:bg-sky-600 transition">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                        </svg>
                    </a>
                    <a href="https://wa.me/+254723700284" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center hover:bg-green-600 transition">
                        <FaWhatsapp className="w-5 h-5 text-white"  />
                       
                    </a>
                    <a href="https://github.com/001kenji" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center hover:bg-purple-600 transition">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                        </svg>
                    </a>
                    <a href="mailto:briannjuguna694@gmail.com?subject=Hello&body=Hi%2C%20I%20would%20like%20to%20get%20in%20touch!" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center hover:bg-blue-600 transition">
                        <AiOutlineMail className="w-5 h-5 text-white" />
                       
                    </a>
                    </div>
                </div>
                </div>

                {/* Contact Form */}
                <div className="bg-transparent shadow-xs dark:shadow-none shadow-slate-400 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 dark:border dark:border-slate-700/50">
                    <h3 className="text-2xl font-semibold text-black dark:text-white mb-6 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        Send Me a Message
                    </h3>
                    
                    <form ref={form} onSubmit={sendEmail} className="space-y-4">
                        <div>
                        <label htmlFor="name" className="block text-sm font-medium  text-black dark:text-slate-300 mb-1">Name</label>
                        <input 
                            type="text" 
                            name="from_name" 
                            id="from_name"
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-black dark:text-white placeholder:text-slate-800 dark:placeholder-slate-400" 
                            placeholder="Your name"
                            required
                        />
                        </div>
                        
                        <div>
                        <label htmlFor="email" className="block text-sm font-medium  text-black dark:text-slate-300 mb-1">Email</label>
                        <input 
                            type="email" 
                            id="reply_to"
                            name="reply_to" 
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500  text-black dark:text-white placeholder:text-slate-800 dark:placeholder-slate-400" 
                            placeholder="your.email@example.com"
                            required
                        />
                        </div>
                        
                        <div>
                        <label htmlFor="subject" className="block text-sm font-medium  text-black dark:text-slate-300 mb-1">Subject</label>
                        <input 
                            type="text" 
                            id="subject"
                            name="subject" 
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500  text-black dark:text-white placeholder:text-slate-800 dark:placeholder-slate-400" 
                            placeholder="What's this about?"
                            required
                        />
                        </div>
                        
                        <div>
                        <label htmlFor="message" className="block text-sm font-medium  text-black dark:text-slate-300 mb-1">Message</label>
                        <textarea 
                            id="message" 
                            name="message"
                            rows="4" 
                            className="w-full px-4 py-2 bg-gray-50/50 dark:bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500  text-black dark:text-white placeholder:text-slate-800 dark:placeholder-slate-400" 
                            placeholder="Your message here..."
                            required
                        ></textarea>
                        </div>
                        
                        <button 
                        type="submit" 
                        disabled={isSending}
                        className="w-full py-3 px-6 bg-gradient-to-r from-rose-600 to-amber-600 text-white font-medium rounded-lg hover:from-sky-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                        {isSending ? (
                            <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                            </>
                        ) : (
                            <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Send Message
                            </>
                        )}
                        </button>

                        {sendStatus === 'success' && (
                        <div className="mt-4 p-3 dark:bg-green-500/20 bg-green-500 border border-green-500 text-black dark:text-green-300 rounded-lg">
                            Message sent successfully! I'll get back to you soon.
                        </div>
                        )}

                        {sendStatus === 'error' && (
                        <div className="mt-4 p-3 bg-red-500 dark:bg-red-500/20 border border-red-500 text-white dark:text-red-300 rounded-lg">
                            Failed to send message. Please try again or contact me directly via email: briannjuguna694@gmail.com
                        </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )


}
const mapStateToProps =  state => ({
    isAuthenticated:state.auth.isAuthenticated,
    
}) 
export default connect(mapStateToProps,null)(ContactMe)