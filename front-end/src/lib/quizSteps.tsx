interface QuizField {
  name: string;
  label: string;
  placeholder?: string;
}

export interface QuizStep {
  id: number;
  key: string;
  title: string;
  type: "multi" | "pair" | "inputs" | "range";
  options?: string[];
  fields?: QuizField[];
  required?: boolean;
}

export const quizSteps: QuizStep[] = [
  { id: 1, key: "occasion",   title: "What are you shopping for?",      type: "multi",  options: ["Work","Casual","Date","Party","Travel","Formal"], required: true },
  { id: 2, key: "style_vibe", title: "Which style describes you best?", type: "multi",  options: ["Minimal","Street","Smart-casual","Athleisure","Classic","Trendy"], required: true },
  { id: 3, key: "colors_like",title: "Which colors do you love?",       type: "multi",  options: ["Black","White","Beige","Navy","Grey","Olive","Brown","Denim"] },
  { id: 4, key: "height",     title: "How tall are you?",               type: "pair",   fields: [{name:"ft",label:"Ft"},{name:"in_",label:"In_"}] },
  { id: 5, key: "sizes",      title: "Your sizes",                       type: "inputs", fields: [{name:"tops",label:"Top size",placeholder:"M"},{name:"bottoms",label:"Bottom size",placeholder:"30"}], required: true },
  { id: 6, key: "budget",     title: "Price range per item",             type: "range",  fields: [{name:"min",label:"Min (€)"},{name:"max",label:"Max (€)"}], required: true },
];
