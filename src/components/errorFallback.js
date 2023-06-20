"use client";

const ErrorFallback = () => {
    return (
        <div className="w-full">
            <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold tracking-normal text-slate-900 sm:text-7xl">500 Internal Server Error</h1>
            <p className="mx-auto mt-12 max-w-xl text-lg text-slate-700 leading-7">
                Oops! Something went wrong on the server. Our team has been notified and we are
                working to resolve the issue.
            </p>
        </div>
    );
};

export default ErrorFallback;
