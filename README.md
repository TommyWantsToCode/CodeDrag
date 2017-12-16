# CodeDrag

 -- Desarrollo web Drag&amp;Drop -- (Planeo reescribir el codigo para hacerlo mas entendible, y rediseñar el editor)

* Para que funcione el proyecto necesita JQuery (jquery-3.2.1.min.js) y debe de estár en un servidor, aunque sea local (127.0.0.1/localhost) pero no (file:///C...)

* La pagina recibe un JSON, CodeDrag importa los plugins de la carpeta plugins y hace el render de la pagina

* Los plugins son archivos js (javascript), dentro de este archivo se tiene el HTML/CSS/JAVASCRIPT en lugar de tener 3 archivos para un elemento (html, css, js)

* No es necesario agregar tags HTML para importar plugins, javascript hace esto por nosotros

* El editor está en el mismo navegador

* Cada plugin tiene propiedades programables, maneja CSS para computadora y para celular, permite ejecutar javascript al iniciar

* De momento solo funciona para paginas estaticas, que no reciben informacion de servidores, aunque planeo agregar algo para resolver esto
