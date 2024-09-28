# Общее описание

Данный проект представляет из себя прототип программы расчета обмена и преобразования ресурсов.
Для выполнения расчета необходимо указать список собственных ресурсов и описание возможных вариантов их обмена или преобразования.
Чтобы указать, какие ресурсы требуется получить в результате обмена, необходимо добавить их в список собственных ресурсов и указать отрицательное количество.
Результатом выполнения расчета будет древовидная структура с описанием всех возможных вариантов получения требуемых ресурсов.

# Область применимости

Можно использовать для
* расчета обмена ресурсами через некоторое количество посредников при условии, что есть информация о том, кто, что и на что может обменять;
* расчета получения требуемых ресурсов через преобразование тех, которые есть в наличии (в т.ч. для расчета производственных цепочек);
* расчетов, сочетающих в себе оба предыдущих пункта.

# Установка и запуск

Для запуска достаточно скачать все файлы проекта и поместить в одну папку, после чего открыть файл resourcecalc.html в браузере.
Все расчеты происходят локально и не требуют подключения к интернету.
Исходные данные можно вводить вручную или загружать из JSON файлов. Примеры таких файлов прилагаются.

# Ограничения

Данный проект является прототипом, а не полноценным решением для проведения подобных расчетов, и имеет ряд ограничений:
* Нельзя переключить очередность использования ресурсов при преобразовании (ресурсы в разделе "Собственные ресурсы точки" всегда используются первыми).
* Не работают правила обмена, если в них и в списке собственных ресурсов точки используются разные типы ресурсов для обозначения одного и того же типа в разных единицах измерения.
* Нет полноценной поддержки общих / разделяемых ресурсов.
