export const brightness = color => {
    if(color.length === 7){color=color.substring(1);}
    var R = parseInt(color.substring(0,2),16);
    var G = parseInt(color.substring(2,4),16);
    var B = parseInt(color.substring(4,6),16);
    return Math.sqrt(R * R * .241 + G * G * .691 + B * B * .068);
}