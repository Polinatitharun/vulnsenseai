// import { useState } from 'react';
// import { Eye, EyeOff, Shield, Lock, User, ArrowLeft } from 'lucide-react';
// import { useUser } from './auth/Authcontext'; 
// import { loginUser } from './auth/api'; 
// import '../styles/LoginPage.css';
// import { toast } from 'sonner';
// import { useLoader } from './loader/Loadercontext';
// import { useNavigate } from 'react-router-dom';
// import { showToast } from './common/Toast';

// export function LoginPage({ onBackToLanding }) {
//   const { showLoader, hideLoader } = useLoader(); 
//   const [showPassword, setShowPassword] = useState(false);
//   const [selectedRole, setSelectedRole] = useState('admin');
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const { login } = useUser(); 
//   const navigate = useNavigate();

//   const handleRoleSelect = (role) => {
//     setSelectedRole(role);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     showLoader();
//     try {
//       const res = await loginUser(formData.email, formData.password);
//       const serverUser = res.user || { username: formData.email, role: selectedRole === 'superAdmin' ? 'superadmin' : 'admin' };
//       login(serverUser, res.access, res.refresh);

//       if (selectedRole === 'superAdmin') {
//         navigate('/super-admin-dashboard');
//       } else {
//         navigate('/admin-dashboard');
//       }
//       showToast("Login successful!", "success");
    
//      } catch (error) {
//       console.error('Login failed:', error);
//       showToast("Login failed. Please check credentials.", "error");
//     } finally {
//       hideLoader();
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   return (
//     <div className="vs-login-page">
//       <div className="vs-login-container">
//         <button onClick={() => navigate("/")} className="vs-back-button">
//           <ArrowLeft className="vs-btn-icon" /> Back to Home
//         </button>
//         <div className="vs-login-header">
//           <div className="vs-login-logo">
//             <Shield className="vs-logo-icon" />
//           </div>
//           <h1>VulnSense AI</h1>
//           <p>Advanced Vulnerability Intelligence</p>
//         </div>
//         <section className='vs-role-section'>

//           <div className="vs-quick-login-grid">
//             {['admin', 'superAdmin'].map((role) => {
//               const isSelected = selectedRole === role;
//               return (
//                 <div
//                   key={role}
//                   className={`vs-quick-login-card ${role === 'superAdmin' ? 'vs-superadmin-card' : 'vs-admin-card'} ${isSelected ? 'selected' : ''}`}
//                   onClick={() => handleRoleSelect(role)}
//                 >
//                   <div className="vs-quick-login-header">
//                     <h3>{role === 'superAdmin' ? 'Super Admin' : 'Admin'}</h3>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           <div className={`vs-login-card vs-login-card-animate ${selectedRole === 'superAdmin' ? 'superadmin-active' : ''}`}>
//             <div className="vs-login-card-header">
//               <h2>Sign in as {selectedRole === 'superAdmin' ? 'Super Admin' : 'Admin'}</h2>
//             </div>
//             <div className="vs-login-card-content">
//               <form onSubmit={handleSubmit} className="vs-login-form">
//                 <div className="vs-form-group">
//                   <label htmlFor="email">Username</label>
//                   <div className="vs-input-container">
//                     <User className="vs-input-icon" />
//                     <input
//                       id="email"
//                       name="email"
//                       type="username"
//                       placeholder="Enter your email"
//                       value={formData.email}
//                       onChange={handleInputChange}
//                       className="vs-form-input vs-input-with-icon"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="vs-form-group">
//                   <label htmlFor="password">Password</label>
//                   <div className="vs-input-container">
//                     <Lock className="vs-input-icon" />
//                     <input
//                       id="password"
//                       name="password"
//                       type={showPassword ? 'text' : 'password'}
//                       placeholder="Enter your password"
//                       value={formData.password}
//                       onChange={handleInputChange}
//                       className="vs-form-input vs-input-with-icon vs-input-with-action"
//                       required
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="vs-input-action"
//                     >
//                       {showPassword ? <EyeOff className="vs-action-icon" /> : <Eye className="vs-action-icon" />}
//                     </button>
//                   </div>
//                 </div>

//                 <button type="submit" className="vs-btn vs-btn-primary vs-btn-full">
//                   Sign In
//                 </button>
//               </form>
//             </div>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }




import { useState } from 'react';
import { Eye, EyeOff, Shield, Lock, User, ArrowLeft } from 'lucide-react';
import { useUser } from './auth/Authcontext'; 
import { loginUser } from './auth/api'; 
import '../styles/LoginPage.css';
import { useLoader } from './loader/Loadercontext';
import { useNavigate } from 'react-router-dom';
import { showToast } from './common/Toast';

export function LoginPage() {
  const { showLoader, hideLoader } = useLoader(); 
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useUser(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoader();
    try {
      const res = await loginUser(formData.email, formData.password);

      const serverUser = res.user;
      login(serverUser, res.access, res.refresh);

      // AUTO REDIRECT BASED ON BACKEND ROLE
      if (serverUser.role === 'superadmin') {
        navigate('/super-admin-dashboard');
      } else if (serverUser.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-dashboard');
      }

      showToast("Login successful!", "success");

    } catch (error) {
      console.error('Login failed:', error);
      showToast("Login failed. Please check credentials.", "error");
    } finally {
      hideLoader();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="vs-login-page">
      <div className="vs-login-container">
        <button onClick={() => navigate("/")} className="vs-back-button">
          <ArrowLeft className="vs-btn-icon" /> Back to Home
        </button>

        <div className="vs-login-header">
          <div className="vs-login-logo">
            <Shield className="vs-logo-icon" />
          </div>
          <h1>VulnSense AI</h1>
          <p>Advanced Vulnerability Intelligence</p>
        </div>

        <section className='vs-role-section'>

          {/* ⭐ REMOVED ADMIN / SUPERADMIN CARDS */}

          <div className="vs-login-card vs-login-card-animate">
            <div className="vs-login-card-header">
              <h2>Sign In</h2> {/* Updated Heading */}
            </div>

            <div className="vs-login-card-content">
              <form onSubmit={handleSubmit} className="vs-login-form">
                
                <div className="vs-form-group">
                  <label htmlFor="email">Username</label>
                  <div className="vs-input-container">
                    <User className="vs-input-icon" />
                    <input
                      id="email"
                      name="email"
                      type="text"
                      placeholder="Enter your username"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="vs-form-input vs-input-with-icon"
                      required
                    />
                  </div>
                </div>

                <div className="vs-form-group">
                  <label htmlFor="password">Password</label>
                  <div className="vs-input-container">
                    <Lock className="vs-input-icon" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="vs-form-input vs-input-with-icon vs-input-with-action"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="vs-input-action"
                    >
                      {showPassword ? <EyeOff className="vs-action-icon" /> : <Eye className="vs-action-icon" />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="vs-btn vs-btn-primary vs-btn-full">
                  Sign In
                </button>

              </form>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}
