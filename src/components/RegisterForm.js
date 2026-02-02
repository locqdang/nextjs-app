import { useForm } from 'react-hook-form';
import { useState } from 'react';

export default function RegisterForm(){

    const { register, handleSubmit, formState: { errors } } = useForm({
        // defaultValues: {
        //     name: "loc",
        //     email: "locqdang@gmail.com",
        //     password: "meomeo",
        //     passwordConfirm: "meomeo"
        // }
    });
    const [serverError, setServerError] = useState('');
    const [serverSuccess, setServerSuccess] = useState('');

    async function submitForm(data){
        setServerError('');
        setServerSuccess('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload?.error || payload?.message || 'Registration failed');
            }

            setServerSuccess(payload?.message || 'User registered successfully');
        } catch (error) {
            setServerError(error?.message || 'Something went wrong');
        }
    }
    
    return(
        <form className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md" onSubmit={handleSubmit(submitForm)}>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Register</h2>
            
            <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Name:</label>
                <input 
                    type="text" 
                    id="name" 
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && <p className="text-red-600 mt-1 text-sm">{errors.name.message}</p>}
            </div>
            
            <div className="mb-6">
                <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email:</label>
                <input 
                    type="email" 
                    id="email" 
                    {...register('email', { required: 'Email is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && <p className="text-red-600 mt-1 text-sm">{errors.email.message}</p>}
            </div>

            <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Password:</label>
                <input 
                    type="password" 
                    id="password" 
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.password && <p className="text-red-600 mt-1 text-sm">{errors.password.message}</p>}
            </div>

            <div className="mb-6">
                <label htmlFor="passwordConfirm" className="block text-gray-700 font-semibold mb-2">Confirm Password:</label>
                <input 
                    type="password" 
                    id="passwordConfirm" 
                    {...register('passwordConfirm', { required: 'Please confirm your password' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.passwordConfirm && <p className="text-red-600 mt-1 text-sm">{errors.passwordConfirm.message}</p>}
            </div>

            {serverError && <p className="text-red-600 mb-3">{serverError}</p>}
            {serverSuccess && <p className="text-green-600 mb-3">{serverSuccess}</p>}
            
            <button 
                type="submit" 
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
                Register
            </button>
        </form>
    )
}