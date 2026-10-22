export const facts = [
 {topic:'skills java dsa oops dbms sql mysql git github visual studio code technologies',title:'Technical skills',text:'Nithin’s nine technical skills are Java, Data Structures and Algorithms (DSA), Object-Oriented Programming (OOPS), Database Management Systems (DBMS), SQL, MySQL, Git, GitHub, and Visual Studio Code.'},
 {topic:'campusflow project projects application university student management spring boot react docker architecture',title:'CampusFlow',text:'CampusFlow is a university management project using Java, Spring Boot, React, MySQL, REST APIs and Docker. The repository implements student, department and placement REST CRUD. The wider university dashboards use browser-local demo workflows. Authentication is a demonstration and is not production security. Repository: https://github.com/Venkatanithinp/CampusFlow-University-Management-System'},
 {topic:'education college school cgpa marks degree background srm ramapuram btech university',title:'Education',text:'Nithin studies B.Tech Computer Science and Engineering at SRM Institute of Science and Technology, Ramapuram (2023–2027), with CGPA 7.71/10. He completed Class XII MPC at Sri Chaitanya Junior College (2021–2023), Andhra Pradesh Board, 72%, and Class X at Sir C R Reddy Public School (2020–2021), CBSE, 66%.'},
 {topic:'resume cv download pdf',title:'Resume',text:'Visit /resume to preview and download the latest published PDF. The owner can replace it through the private Admin area.'},
 {topic:'contact email linkedin github hire connect reach availability',title:'Contact',text:'Email Nithin at pinnamanenivenkatanithin@gmail.com. GitHub: https://github.com/Venkatanithinp. LinkedIn: https://www.linkedin.com/in/venkata-nithin-p-ab2690335. He is an aspiring Software Developer and a Computer Science Engineering student.'},
 {topic:'certifications experience internship shadowfox hackerrank servicenow deloitte coursera nlp react sql',title:'Certifications and experience',text:'Approved items: HackerRank SQL (Basic) and Frontend Developer (React) (June 16, 2026); ServiceNow Welcome to ServiceNow Micro-Certification (January 2, 2026); DeepLearning.AI/Coursera NLP Classification and Vector Spaces (March 25, 2026); Deloitte Data Analytics Job Simulation via Forage (May 4, 2026); ShadowFox UI/UX Design Virtual Internship (January 2–31, 2026). The Deloitte item is a job simulation, not employment. All six original certificate PDFs are available in the Keep Evolving section at /#certifications.'},
 {topic:'about who nithin venkata introduction career goal developer profession occupation work do does student aspiring',title:'About Nithin',text:'Venkata Nithin is a Computer Science Engineering student and aspiring Software Developer. He enjoys exploring technology, solving problems, and turning ideas into meaningful digital experiences. His portfolio motto is “Exploring technology. Creating possibilities.”'},
];
const stops=new Set(['a','the','is','of','to','and','in','does','what','his','he','me','tell','about','nithin','venkata','have','has','can','i','you','your']);
const tokens=(s:string)=>s.toLowerCase().match(/[a-z0-9]+/g)?.filter(w=>!stops.has(w))??[];
export function retrieve(question:string){
 const q=tokens(question);const docs=facts.map(f=>tokens(f.topic+' '+f.text));
 const idf=(w:string)=>Math.log((facts.length+1)/(1+docs.filter(d=>d.includes(w)).length))+1;
 const results=facts.map((f,i)=>{const d=docs[i];let score=0;for(const w of new Set(q))if(d.includes(w))score+=idf(w)*(tokens(f.topic).includes(w)?2:1);return {...f,score};}).sort((a,b)=>b.score-a.score);
 return results;
}
export type AnswerLink={label:string;href:string};
export type PortfolioAnswer={answer:string;source:string;links:AnswerLink[]};
const answer=(index:number,links:AnswerLink[]=[],text?:string):PortfolioAnswer=>({answer:text??facts[index].text,source:facts[index].title,links});
const links={resume:[{label:'View & download resume',href:'/resume'}],project:[{label:'CampusFlow on GitHub',href:'https://github.com/Venkatanithinp/CampusFlow-University-Management-System'}],contact:[{label:'Email Nithin',href:'mailto:pinnamanenivenkatanithin@gmail.com'},{label:'LinkedIn',href:'https://www.linkedin.com/in/venkata-nithin-p-ab2690335'}],certs:[{label:'Explore certificates',href:'/#certifications'}]};
export function groundedAnswer(question:string,previousQuestions:string[]=[]):PortfolioAnswer {
 const q=question.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
 const prior=previousQuestions.slice(-3).join(' ').toLowerCase();
 if(/invent|make up|fabricat|ignore (all|everything|previous|instructions)/.test(q))return {answer:'I only use approved portfolio information and can’t invent experience or achievements. Nithin is a Computer Science Engineering student and aspiring Software Developer.',source:'Approved portfolio information',links:links.resume};
 if(/^(hi|hello|hey|good morning|good evening)( there)?$/.test(q))return {answer:'Hello! I’m VN. AI., Nithin’s portfolio assistant. Ask about his work, skills, education, certificates, or resume.',source:'Portfolio assistant',links:links.resume};
 if(/^(thanks|thank you|thank u|thx|okay|ok|cool|great)\b/.test(q))return {answer:'You’re welcome! Happy to help you get to know Nithin.',source:'Portfolio assistant',links:[]};
 if(/who are you|what can you do|are you (a bot|ai)|your name/.test(q))return {answer:'I’m VN. AI., a guide to Nithin’s approved portfolio information. I can help you explore his skills, CampusFlow, education, certificates, and resume.',source:'Portfolio assistant',links:links.resume};
 if(/phone|mobile number|address|salary|age|married|birthday/.test(q))return {answer:'That detail isn’t included in Nithin’s public portfolio. You can contact him directly by email.',source:'Public contact information',links:links.contact};
 if(/cgpa|gpa/.test(q))return answer(2,[], 'His B.Tech CGPA is 7.71/10 at SRM Institute of Science and Technology, Ramapuram.');
 if(/graduat|pass out|passing|batch/.test(q))return answer(2,[],'Nithin’s B.Tech Computer Science and Engineering program runs from 2023 to 2027. His expected graduation year is 2027.');
 if(/which college|where (does|did|is) he (study|studying)|college name|campus/.test(q)&&!q.includes('campusflow'))return answer(2,[],'He studies Computer Science and Engineering at SRM Institute of Science and Technology, Ramapuram (2023–2027).');
 if(/deloitte/.test(q))return answer(5,links.certs,'He completed the Deloitte Data Analytics Job Simulation through Forage on May 4, 2026. It covered practical tasks in data analysis and forensic technology. This is a job simulation, not Deloitte employment.');
 if(/shadowfox|intern(ship)?|professional experience|work experience|previous experience/.test(q))return answer(5,links.certs,'His approved experience includes a UI/UX Design virtual internship at ShadowFox, January 2–31, 2026. He also completed a Deloitte Data Analytics Job Simulation via Forage. The simulation is a learning experience, not employment.');
 if(/resume|cv|pdf/.test(q)&&!(/certificat|credential/.test(q)))return answer(3,links.resume);
 if(/certificat|certifcation|credential|hackerrank|coursera|servicenow|deep ?learning/.test(q))return answer(5,links.certs);
 if(/campusflow|project|spring|docker|architecture|rest api/.test(q))return answer(1,links.project);
 if(/email|contact|reach|linkedin|hire|hiring|recruit|opportunit|connect/.test(q))return answer(4,links.contact);
 if(/github|git hub|repository|repo/.test(q))return /campusflow|project/.test(prior)?answer(1,links.project):answer(4,[{label:'GitHub profile',href:'https://github.com/Venkatanithinp'}],'You can explore Nithin’s repositories on GitHub at https://github.com/Venkatanithinp. His featured project is CampusFlow.');
 if(/skill|skil|know|programming|language|tech stack|technolog|tool|expertise|good at|what can he/.test(q))return answer(0);
 if(/education|educat|qualification|degree|school|marks|background|btech|b tech|stud(y|ies|ying)/.test(q))return answer(2);
 if(/who is|tell me about him|introduc|about (him|nithin)|what (does|do) (he|nithin) do|profession|occupation|career|goal|aspir|developer|what is he/.test(q))return answer(6,links.resume);
 // Follow-up requests inherit the topic of the last question, never unverified
 // facts supplied by a visitor. The latest explicit question always wins.
 if(/^(and )?(more|tell me more|explain|explain more|details|link|show me|where|how about that|what about that|yes|please)( please)?$/.test(q)&&prior){
  return groundedAnswer(previousQuestions[previousQuestions.length-1]);
 }
 const matches=retrieve(q);
 if(matches[0]?.score>0){const index=facts.findIndex(f=>f.title===matches[0].title);return answer(index,index===1?links.project:index===3?links.resume:index===4?links.contact:index===5?links.certs:[]);}
 return {answer:'I don’t have an approved detail for that yet. I can tell you what Nithin does, what he’s studying, his skills, CampusFlow, certificates, or how to contact him. Try “What does he do?” or “Tell me about his project.”',source:'Approved portfolio information',links:links.resume};
}
