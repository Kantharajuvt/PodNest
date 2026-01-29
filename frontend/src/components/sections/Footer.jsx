import React from 'react';
import { motion } from 'framer-motion';
import {
    Mic, Video, ArrowUp,
    Twitter, Github, Linkedin,
    Instagram, Mail
} from 'lucide-react';

const Footer = () => {
    return (
        <footer className="pt-24 pb-12 border-t border-white/5 bg-[#050508] relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-20">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-pink rounded-xl flex items-center justify-center">
                                <Mic className="text-white w-7 h-7" />
                            </div>
                            <span className="text-3xl font-bold">PodNest</span>
                        </div>
                        <p className="text-white/40 text-lg font-medium leading-relaxed max-w-sm">
                            The professional remote recording studio for creators who demand studio-quality content everywhere.
                        </p>
                        <div className="flex items-center gap-4">
                            <SocialIcon icon={Twitter} />
                            <SocialIcon icon={Linkedin} />
                            <SocialIcon icon={Instagram} />
                            <SocialIcon icon={Github} />
                        </div>
                    </div>

                    {/* Links Columns */}
                    <FooterLinks title="Product" links={['Features', 'Pricing', 'Studio', 'API', 'App Download']} />
                    <FooterLinks title="Resources" links={['Blog', 'Help Center', 'Success Stories', 'Community', 'Status']} />
                    <FooterLinks title="Company" links={['About Us', 'Careers', 'Privacy Policy', 'Terms of Service', 'Cookie Policy']} />

                    {/* Newsletter Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <p className="font-bold text-white uppercase tracking-widest text-xs">Newsletter</p>
                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-accent-purple/50 pr-12 transition-all"
                            />
                            <button className="absolute right-2 top-1.2 w-9 h-9 flex items-center justify-center bg-accent-purple rounded-lg hover:scale-105 transition-transform">
                                <Mail className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <p className="text-white/30 text-sm font-medium">
                        © 2026 PodNest Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8 text-sm font-bold text-white/30">
                        <a href="#" className="hover:text-accent-purple transition-colors">Privacy</a>
                        <a href="#" className="hover:text-accent-purple transition-colors">Security</a>
                        <a href="#" className="hover:text-accent-purple transition-colors">Legal</a>
                    </div>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-accent-purple/10 transition-colors"
                    >
                        <ArrowUp className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ icon: Icon }) => (
    <a href="#" className="p-3 glass rounded-xl hover:bg-accent-purple/20 transition-all group">
        <Icon className="w-5 h-5 text-white/40 group-hover:text-accent-purple" />
    </a>
);

const FooterLinks = ({ title, links }) => (
    <div className="space-y-6">
        <p className="font-bold text-white uppercase tracking-widest text-xs">{title}</p>
        <ul className="space-y-4">
            {links.map((link, i) => (
                <li key={i}>
                    <a href="#" className="text-white/40 font-bold hover:text-white transition-colors">{link}</a>
                </li>
            ))}
        </ul>
    </div>
);

export default Footer;
