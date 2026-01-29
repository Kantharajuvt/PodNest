import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Minus } from 'lucide-react';

const faqs = [
    {
        q: "How does local recording work?",
        a: "PodNest records each guest direct-to-disk on their own computer. This means that even if someone's internet connection drops or glitches, the final recorded files will be crystal clear. Once the session ends, the high-quality files are uploaded automatically to our cloud storage."
    },
    {
        q: "Do my guests need to create an account?",
        a: "Absolutely not. You simply send them a magic link, and they join directly from their browser (Chrome, Safari, Edge). There are no apps to install or accounts to create for guests."
    },
    {
        q: "Can I record in 4K video?",
        a: "Yes! All PodNest Recording sessions support local 4K video recording for all participants. You'll receive primary video tracks and separate secondary tracks for every guest."
    },
    {
        q: "Is there a limit to how many guests I can invite?",
        a: "Depending on your plan, you can invite up to 8 guests per session. Each guest will have their own dedicated high-fidelity track."
    },
    {
        q: "What format are the final files in?",
        a: "We provide high-quality WAV files for audio and MP4 (H.264) for video. These tracks are perfectly synced and ready to be dropped into any professional editing software like Adobe Premiere, Final Cut, or DaVinci Resolve."
    },
    {
        q: "How secure is my content?",
        a: "Security is our top priority. All recordings are encrypted in transit and at rest. We also provide SSO options for enterprise teams."
    }
];

const FAQ = () => {
    return (
        <section id="faq" className="py-24 relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Got questions? <br /> We've got answers.</h2>
                    <p className="text-white/60 text-lg font-medium">Everything you need to know about the professional remote studio.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <AccordionItem key={i} question={faq.q} answer={faq.a} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const AccordionItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden transition-all hover:border-white/10 hover:bg-white/[0.04]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-8 text-left group"
            >
                <h3 className="text-xl font-bold group-hover:text-accent-purple transition-colors">{question}</h3>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    {isOpen ? <Minus className="w-5 h-5 text-accent-purple transition-transform duration-300" /> : <Plus className="w-5 h-5 text-white/30 group-hover:text-white transition-all" />}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="px-8 pb-8 text-white/50 text-lg leading-relaxed font-medium">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FAQ;
