export const isEmailPhone = (str) =>{
    const Emailregex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const Phoneregex = /^\+?([0-9]{2})\)?([0-9]{10})$/;

    if(Emailregex.test(str)) return "email";
    if(Phoneregex.test(str)) return "phone";

    return "none";
}