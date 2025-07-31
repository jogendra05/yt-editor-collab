import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Upload, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Sparkles,
  Rocket,
  Globe,
  TrendingUp,
  Clock,
  DollarSign
} from 'lucide-react';

export const LandingPage = ({ onStart }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({
    'hero-content': true, // Make hero visible immediately
    'problem': false,
    'solution': false,
    'features': false,
    'stats': false,
    'cta': false
  });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    // Add a longer delay to ensure DOM elements are rendered
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('[id]');
      console.log('Observing elements:', elements.length); // Debug log
      elements.forEach((el) => {
        observer.observe(el);
        // Make elements visible if they're already in viewport
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setIsVisible(prev => ({
            ...prev,
            [el.id]: true
          }));
        }
      });
    }, 300); // Increased delay

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const AnimatedSection = ({ id, children, className = "" }) => (
    <div
      id={id}
      className={`opacity-100 translate-y-0 ${className}`}
    >
      {children}
    </div>
  );

  // Add click handlers for buttons
  const handleStartClick = () => {
    if (onStart) {
      onStart();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div 
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"
          style={{ transform: `translateY(${-scrollY * 0.1}px)` }}
        />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 z-10">
        <div className="max-w-6xl mx-auto text-center">
          <AnimatedSection id="hero-content">
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-3 mb-8">
                <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                <span className="text-purple-200 font-medium">Revolutionary YouTube Upload Service</span>
                <Rocket className="h-5 w-5 text-pink-400 animate-bounce" />
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-6 animate-pulse">
                YT Editor Hub 🚀
              </h1>
              
              <p className="text-2xl md:text-3xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                Stop wasting your <span className="text-purple-400 font-bold">precious bandwidth</span> 📡 
                <br />
                Let our servers handle the heavy lifting! ⚡
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button
                  onClick={handleStartClick}
                  className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 px-12 rounded-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center gap-4 text-xl"
                >
                  <Play className="h-6 w-6 group-hover:animate-pulse" />
                  Start Creating Now
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </button>
                
                <div className="flex items-center gap-2 text-gray-400">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span>Trusted by 10,000+ creators</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Problem Section */}
      <AnimatedSection id="problem" className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              The Problem 😤
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Current YouTube upload process is draining your bandwidth and wallet! 💸
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 backdrop-blur-sm hover:bg-red-500/20 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Double Data Usage 📊</h3>
                </div>
                <p className="text-gray-300 text-lg">
                  Upload to storage + Upload to YouTube = 2x your bandwidth costs!
                </p>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-8 backdrop-blur-sm hover:bg-orange-500/20 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Slow Uploads ⏰</h3>
                </div>
                <p className="text-gray-300 text-lg">
                  Your home internet struggling with massive video files
                </p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-8 backdrop-blur-sm hover:bg-yellow-500/20 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-yellow-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Expensive Bills 💰</h3>
                </div>
                <p className="text-gray-300 text-lg">
                  Mobile data plans crying from massive video uploads
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 hover:scale-105 transition-all duration-500">
                <h4 className="text-2xl font-bold text-white mb-6 text-center">Current Flow 😰</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                    <Upload className="h-6 w-6 text-red-400" />
                    <div>
                      <p className="text-white font-medium">Step 1: Upload to Storage</p>
                      <p className="text-red-400 text-sm">100MB ↑ (Your bandwidth)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                    <Globe className="h-6 w-6 text-red-400" />
                    <div>
                      <p className="text-white font-medium">Step 2: Server Downloads</p>
                      <p className="text-red-400 text-sm">100MB ↓ (Server bandwidth)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                    <Play className="h-6 w-6 text-red-400" />
                    <div>
                      <p className="text-white font-medium">Step 3: Upload to YouTube</p>
                      <p className="text-red-400 text-sm">100MB ↑ (Server bandwidth)</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-red-500/20 rounded-xl border border-red-500/50">
                  <p className="text-center text-red-300 font-bold">
                    Total: 200MB server usage + Your upload! 😱
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Solution Section */}
      <AnimatedSection id="solution" className="py-20 px-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 mb-6">
              Our Solution ✨
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We handle the heavy lifting so you don't have to! 🏋️‍♂️
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-green-800/50 to-cyan-800/50 backdrop-blur-sm border border-green-500/50 rounded-3xl p-8 hover:scale-105 transition-all duration-500">
                <h4 className="text-2xl font-bold text-white mb-6 text-center">Optimized Flow 🎉</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                    <Upload className="h-6 w-6 text-green-400" />
                    <div>
                      <p className="text-white font-medium">Step 1: Upload Once</p>
                      <p className="text-green-400 text-sm">100MB ↑ (Your only cost!)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                    <Zap className="h-6 w-6 text-cyan-400 animate-pulse" />
                    <div>
                      <p className="text-white font-medium">Step 2: We Handle Everything</p>
                      <p className="text-cyan-400 text-sm">Our servers do the work! ⚡</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                    <Play className="h-6 w-6 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">Step 3: Live on YouTube</p>
                      <p className="text-purple-400 text-sm">Zero additional cost to you! 🎊</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-xl border border-green-500/50">
                  <p className="text-center text-green-300 font-bold">
                    You pay: Only 100MB! We handle the rest! 🎯
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 backdrop-blur-sm hover:bg-green-500/20 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:animate-pulse">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">50% Less Bandwidth 📉</h3>
                </div>
                <p className="text-gray-300 text-lg">
                  Upload once, we handle YouTube delivery with our enterprise servers!
                </p>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-8 backdrop-blur-sm hover:bg-cyan-500/20 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:animate-spin">
                    <Zap className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Lightning Fast ⚡</h3>
                </div>
                <p className="text-gray-300 text-lg">
                  Our high-speed servers upload to YouTube faster than your home connection!
                </p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-8 backdrop-blur-sm hover:bg-purple-500/20 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:animate-bounce">
                    <Shield className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Secure & Reliable 🔒</h3>
                </div>
                <p className="text-gray-300 text-lg">
                  Enterprise-grade security with 99.9% uptime guarantee!
                </p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection id="features" className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Why Creators Love Us 💖
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of creators who've already optimized their workflow! 🌟
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Seamless Collaboration",
                description: "Creators and editors work together effortlessly",
                emoji: "🤝",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Upload,
                title: "Smart Upload System",
                description: "One upload, multiple possibilities",
                emoji: "🎯",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Zap,
                title: "Instant Processing",
                description: "Videos ready for YouTube in minutes",
                emoji: "⚡",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Your content is safe with us",
                emoji: "🔐",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: Globe,
                title: "Global CDN",
                description: "Fast uploads from anywhere",
                emoji: "🌍",
                color: "from-indigo-500 to-purple-500"
              },
              {
                icon: Star,
                title: "Premium Support",
                description: "24/7 support for all users",
                emoji: "🎭",
                color: "from-pink-500 to-rose-500"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:bg-gray-700/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:animate-pulse`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  {feature.title}
                  <span className="text-2xl">{feature.emoji}</span>
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Stats Section */}
      <AnimatedSection id="stats" className="py-20 px-4 bg-gradient-to-r from-gray-900/50 to-purple-900/50 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              The Numbers Don't Lie 📊
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "10,000+", label: "Happy Creators", emoji: "😊" },
              { number: "50%", label: "Bandwidth Saved", emoji: "📉" },
              { number: "99.9%", label: "Uptime", emoji: "⚡" },
              { number: "24/7", label: "Support", emoji: "🎭" }
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center group hover:scale-110 transition-all duration-300"
              >
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2 group-hover:animate-pulse">
                  {stat.number}
                </div>
                <div className="text-xl text-gray-300 flex items-center justify-center gap-2">
                  {stat.label}
                  <span className="text-2xl">{stat.emoji}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection id="cta" className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 backdrop-blur-sm border border-purple-500/50 rounded-3xl p-12">
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to Optimize? 🚀
            </h2>
            <p className="text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join the revolution and save bandwidth while creating amazing content! ✨
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={handleStartClick}
                className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 px-12 rounded-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center gap-4 text-xl"
              >
                <Rocket className="h-6 w-6 group-hover:animate-bounce" />
                Launch Your Journey
                <Sparkles className="h-6 w-6 group-hover:animate-pulse" />
              </button>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800/50 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Play className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">YT Editor Hub</span>
          </div>
          <p className="text-gray-400 mb-4">
            Revolutionizing YouTube content creation, one upload at a time 🎬
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 YT Editor Hub. Made with 💜 for creators worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
};