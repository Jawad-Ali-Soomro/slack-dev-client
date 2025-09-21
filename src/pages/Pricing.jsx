import Header from "../components/Header"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

const Pricing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "Forever",
      popular: false,
      features: [
        { name: "Up to 3 projects", included: true },
        { name: "Basic collaboration", included: true },
        { name: "Community support", included: true },
        { name: "1GB storage", included: true },
        { name: "Advanced analytics", included: false },
        { name: "Priority support", included: false },
        { name: "Custom integrations", included: false }
      ]
    },
    {
      name: "Pro",
      price: "$29",
      period: "Per Month",
      popular: true,
      features: [
        { name: "Unlimited projects", included: true },
        { name: "Advanced collaboration", included: true },
        { name: "Priority support", included: true },
        { name: "100GB storage", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Custom integrations", included: true },
        { name: "Team Management", included: false }
      ]
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "Per Month",
      popular: false,
      features: [
        { name: "Unlimited everything", included: true },
        { name: "Enterprise collaboration", included: true },
        { name: "24/7 dedicated support", included: true },
        { name: "Unlimited storage", included: true },
        { name: "Enterprise analytics", included: true },
        { name: "Custom integrations", included: true },
        { name: "Advanced team management", included: true }
      ]
    }
  ]

  return (
    <div className="flex flex-col items-center justify-center relative pt-30 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 min-h-screen">
      <Header />
      
      <motion.main 
        className="container mx-auto px-6 py-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.h1 
            variants={itemVariants}
            className="text-6xl font-bold text-gray-900 dark:text-white  mb-6"
            style={{ fontWeight: 900 }}
          >
            Pricing
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto "
            style={{ fontWeight: 800 }}
          >
            Choose the perfect plan for your development needs
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <motion.section 
          variants={itemVariants}
          className="grid lg:grid-cols-3 gap-8 mb-20"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`glass-card p-8 rounded-2xl relative ${plan.popular ? 'gradient-border' : ''}`}
              whileHover={{ y: -5 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold ">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white  mb-4" style={{ fontWeight: 900 }}>
                  {plan.name}
                </h3>
                <div className="text-5xl font-bold text-orange-500 mb-2">
                  {plan.price}
                </div>
                <div className="text-sm font-bold text-gray-600 dark:text-gray-300 ">
                  {plan.period}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      feature.included ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {feature.included ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <X className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className={`text-sm font-bold  ${
                      feature.included ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <motion.button
                className={`w-full py-4 rounded-full font-bold text-sm  transition-colors ${
                  plan.popular 
                    ? 'bg-orange-500 text-white hover:bg-orange-600' 
                    : 'border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {plan.name === 'Free' ? 'Get Started' : 'Choose Plan'}
              </motion.button>
            </motion.div>
          ))}
        </motion.section>

        {/* FAQ Section */}
        <motion.section 
          variants={itemVariants}
          className="text-center"
        >
          <h2 className="text-4xl text-gray-900 dark:text-white  mb-8" style={{ fontWeight: 900 }}>
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: "Can I change plans anytime?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "Is there a free trial?",
                answer: "All paid plans come with a 14-day free trial. No credit card required to start."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and bank transfers for enterprise plans."
              },
              {
                question: "Do you offer discounts for students?",
                answer: "Yes, we offer 50% discount for students and educational institutions with valid ID."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="glass-card p-6 rounded-2xl text-left"
                whileHover={{ y: -3 }}
              >
                <h4 className="text-lg font-bold text-gray-900 dark:text-white  mb-3" style={{ fontWeight: 900 }}>
                  {faq.question}
                </h4>
                <p className="text-sm font-bold text-gray-600 dark:text-gray-300  leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.main>
    </div>
  )
}

export default Pricing
