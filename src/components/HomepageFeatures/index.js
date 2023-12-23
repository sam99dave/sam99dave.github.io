import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

const FeatureList = [
  {
    title: "Resume",
    link: "pdf/My-Resume.pdf",
    Svg: require("@site/static/img/resume-icon-v3.svg").default,
    // description: (
    //   <>
    //     Docusaurus was designed from the ground up to be easily installed and
    //     used to get your website up and running quickly.
    //   </>
    // ),
  },
  // {
  //   title: "Easy to Use",
  //   Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
  //   description: (
  //     <>
  //       Docusaurus was designed from the ground up to be easily installed and
  //       used to get your website up and running quickly.
  //     </>
  //   ),
  // },
  // {
  //   title: "Focus on What Matters",
  //   Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
  //   description: (
  //     <>
  //       Docusaurus lets you focus on your docs, and we&apos;ll do the chores. Go
  //       ahead and move your docs into the <code>docs</code> directory.
  //     </>
  //   ),
  // },
  // {
  //   title: "Powered by React",
  //   Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
  //   description: (
  //     <>
  //       Extend or customize your website layout by reusing React. Docusaurus can
  //       be extended while reusing the same header and footer.
  //     </>
  //   ),
  // },
];

function Feature({ Svg, title, description, link }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.featureLink}
          >
            <Svg className={styles.featureSvg} role="img" />
          </a>
        ) : (
          <Svg className={styles.featureSvg} role="img" />
        )}
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

// --------------------------- //

// import React, { useState } from 'react';
// import clsx from 'clsx';
// import styles from './styles.module.css';

// const FeatureList = [
//   {
//     title: 'Resume',
//     link: 'pdf/My-Resume.pdf', // Replace with the actual path to your resume PDF
//     Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
//     description: (
//       <>
//         Extend or customize your website layout by reusing React. Docusaurus can
//         be extended while reusing the same header and footer.
//       </>
//     ),
//   },
//   {
//     title: 'Projects',
//     content: (
//       <>
//         {/* Content for Projects tab */}
//         <p>This tab displays your project links.</p>
//         {/* You can add more details, links, or components here */}
//       </>
//     ),
//   },
// ];

// function FeatureTab({ title, isActive, onClick }) {
//   return (
//     <button
//       className={clsx(styles.featureTab, isActive && styles.activeTab)}
//       onClick={onClick}
//     >
//       {title}
//     </button>
//   );
// }

// function FeatureContent({ content }) {
//   return <div className={styles.featureContent}>{content}</div>;
// }

// export default function HomepageFeatures() {
//   const [activeTab, setActiveTab] = useState(0);

//   return (
//     <section className={styles.features}>
//       <div className="container">
//         <div className="row">
//           <div className={styles.featureTabs}>
//             {FeatureList.map((item, idx) => (
//               <FeatureTab
//                 key={idx}
//                 title={item.title}
//                 isActive={activeTab === idx}
//                 onClick={() => setActiveTab(idx)}
//               />
//             ))}
//           </div>
//           <FeatureContent content={FeatureList[activeTab].content} />
//           {activeTab === 0 && (
//             <div className={styles.resumeLink}>
//               {/* Link to the resume PDF */}
//               <a href={FeatureList[0].link} target="_blank" rel="noopener noreferrer">
//                 View Resume
//               </a>
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }
