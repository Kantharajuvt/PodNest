import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const plans = [
    {
        name: "Free",
        price: "0",
        desc: "Perfect for testing the waters.",
        features: [
            "2 hours of recording/month",
            "720p Video Quality",
            "Local recording mode",
            "1 Guest per session",
            "Community support"
        ]
    },
    {
        name: "Pro",
        price: "999",
        popular: true,
        desc: "The choice of professional creators.",
        features: [
            "Unlimited recording time",
            "4K Video Quality",
            "Separate Audio/Video tracks",
            "Up to 8 Guests",
            "Priority Support",
            "Custom Branding"
        ]
    },
    {
        name: "Business",
        price: "3499",
        desc: "Scaling your media network.",
        features: [
            "Everything in Pro",
            "Advanced Team Controls",
            "SSO & Security features",
            "API Access",
            "Personal Success Manager",
            "Custom Contracts"
        ]
    }
];

const Pricing = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [billing, setBilling] = useState('monthly');
    const [loadingPlan, setLoadingPlan] = useState(null);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [tempPhoneNumber, setTempPhoneNumber] = useState('');
    const [selectedPlanForPhone, setSelectedPlanForPhone] = useState(null);

    const handleSubscribe = async (plan, phoneOverride = null) => {
        if (!user) {
            showToast('info', 'Please log in to subscribe.');
            return;
        }

        if (plan.name === 'Free') {
            showToast('success', 'You are already on the Free plan!');
            return;
        }

        const phoneToUse = phoneOverride || user.phoneNumber;

        if (!phoneToUse && !phoneOverride) {
            setSelectedPlanForPhone(plan);
            setShowPhoneModal(true);
            return;
        }

        setLoadingPlan(plan.name);
        try {
            const response = await api.post('/subscriptions/create', {
                billingCycle: billing,
                planType: plan.name.toUpperCase(),
                phoneNumber: phoneToUse || '9999999999'
            });

            const { paymentSessionId } = response.data;

            const cashfree = Cashfree({
                mode: "sandbox" // or "production"
            });

            const checkoutOptions = {
                paymentSessionId: paymentSessionId,
                redirectTarget: "_self",
            };

            cashfree.checkout(checkoutOptions).then((result) => {
                if (result.error) {
                    showToast('error', result.error.message);
                }
                if (result.redirect) {
                    console.log("Payment will be redirected");
                }
            });
        } catch (error) {
            console.error('Subscription failed:', error);
            showToast('error', error.response?.data?.error || 'Failed to initiate subscription. Check config.');
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <section id="pricing" className="py-32 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-7xl font-bold mb-8">Transparent pricing.</h2>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-10">
                        <span className={cn("text-lg font-bold", billing === 'monthly' ? "text-white" : "text-white/40")}>Monthly</span>
                        <button
                            onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}
                            className="w-16 h-8 rounded-full bg-white/10 p-1 relative"
                        >
                            <div className={cn(
                                "h-6 w-6 rounded-full bg-accent-purple transition-all duration-300",
                                billing === 'yearly' ? "translate-x-8" : "translate-x-0"
                            )} />
                        </button>
                        <span className={cn("text-lg font-bold", billing === 'yearly' ? "text-white" : "text-white/40")}>
                            Yearly <span className="text-xs text-accent-cyan ml-1 bg-accent-cyan/10 px-2 py-0.5 rounded-full">Save 20%</span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className={cn(
                                "p-10 rounded-[48px] glass relative flex flex-col transition-all duration-500",
                                plan.popular && "border-accent-purple/50 bg-accent-purple/5 ring-4 ring-accent-purple/10 shadow-[0_0_80px_rgba(139,92,246,0.1)] md:scale-105 z-10"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-accent-purple rounded-full text-xs font-bold flex items-center gap-2 shadow-xl">
                                    <Star className="w-3 h-3 fill-current" /> MOST POPULAR
                                </div>
                            )}

                            <div className="mb-10">
                                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-6xl font-black">₹{billing === 'monthly' ? plan.price : Math.floor(plan.price * 0.8)}</span>
                                    <span className="text-white/40 font-bold">/mo</span>
                                </div>
                                <p className="mt-4 text-white/50 text-sm font-medium">{plan.desc}</p>
                            </div>

                            <div className="flex-1 space-y-4 mb-10">
                                {plan.features.map((f, j) => (
                                    <div key={j} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-accent-purple/10 flex items-center justify-center border border-accent-purple/20">
                                            <Check className="w-3 h-3 text-accent-purple" />
                                        </div>
                                        <span className="text-sm font-semibold text-white/70">{f}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleSubscribe(plan)}
                                disabled={loadingPlan === plan.name}
                                className={cn(
                                    "w-full py-5 rounded-[24px] font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2",
                                    plan.popular
                                        ? "bg-accent-purple hover:bg-accent-purple/90 shadow-xl shadow-accent-purple/30"
                                        : "bg-white/5 hover:bg-white/10 border border-white/10"
                                )}
                            >
                                {loadingPlan === plan.name ? (
                                    <Zap className="w-5 h-5 animate-spin" />
                                ) : (
                                    plan.name === 'Free' ? 'Current Plan' : 'Get Started'
                                )}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Phone Number Modal */}
            {showPhoneModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-white/10 p-8 rounded-[32px] max-w-md w-full shadow-2xl"
                    >
                        <h3 className="text-2xl font-bold mb-2">Almost there!</h3>
                        <p className="text-white/50 text-sm mb-6">We need your phone number for payment security and verification.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-white/30 ml-1">Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="+91 99999 99999"
                                    value={tempPhoneNumber}
                                    onChange={(e) => setTempPhoneNumber(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-accent-purple/50 font-semibold mt-1"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowPhoneModal(false)}
                                    className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 font-bold transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (tempPhoneNumber.length < 10) {
                                            showToast('error', 'Please enter a valid phone number');
                                            return;
                                        }
                                        setShowPhoneModal(false);
                                        handleSubscribe(selectedPlanForPhone, tempPhoneNumber);
                                    }}
                                    className="flex-1 py-4 rounded-2xl bg-accent-purple hover:bg-accent-purple/90 font-bold transition-all text-sm shadow-lg shadow-accent-purple/20"
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </section>
    );
};

export default Pricing;
