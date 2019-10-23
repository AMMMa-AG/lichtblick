// make json files 'import'-able
declare module "*.json" {
  const value: any;
  export default value;
}
