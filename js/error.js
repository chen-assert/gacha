
window.onerror = (message, source, lineno, colno, error) => {
    let instruction = "Please contact the developer.";
    if (error instanceof ReferenceError) instruction = 
            "The game is being updated! Your browser probably are still keeping some old scripts."
        + "\nIf you still see this message after a hard reload (Ctrl+F5) please contact the developer.";

    alert(
        "An error has occurred:\n" + message + "\n" + source + ":" + lineno + ":" + colno
        + "\n\n" + instruction
    );
};