import Head from "next/head";
import dynamic from "next/dynamic";
import styles from './adminLayout.module.css'
import { useEffect, useState } from "react";

const Sidebar = dynamic(() => import("../Sidebar/Sidebar"), {
    ssr: false,
});
const Navbar = dynamic(() => import("../Navbar/Navbar"), {
    ssr: false,
});


const AdminLayout = ({children}) => {

    return (
        <div>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main className={styles.main_container}>
                <Navbar/>

                <section className={styles.main_section}>
                    <Sidebar />
                    <div className={styles.content_box}>
                        {children}
                    </div>
                </section>

            </main>
        </div>
    );
};

export default AdminLayout;

