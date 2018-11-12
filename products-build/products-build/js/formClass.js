var Form = function (editor, json) {
    var container = new UI.Panel();
    container.setId('questionPage');
    container.dom.className = 'NavPage appPage';

    var qs = makeQuestionPage(json, editor);
    container.dom.appendChild(qs.questions);
    
    var choices = {};

    function updateJson() {
        var newJson = [];
        for (var i = 0; i < json.length; i++) {
            if (json[i].response.length !== 0 && json[i].response[0] && !(json[i].text === 'New Product Square Footage' || json[i].text === 'Remove/Haul')) {
                for (var z = 0; z < json[i].response.length; z++) {
                    var resp = qs.lineList[json[i].ID + "." + json[i].response[z].ID];
                    choices[json[i].ID];
                    if (resp.style.display === 'block') {
                        newJson.push(jQuery.extend(true, {}, json[i]));
                        newJson[newJson.length - 1].response = [json[i].response[z]];
                    }
                }
            } else {
                if (document.getElementById("que" + json[i].ID).style.display === 'block' && !(json[i].text === 'New Product Square Footage' || json[i].text === 'Remove/Haul')) {
                    newJson.push(jQuery.extend(true, {}, json[i]));
                    newJson[newJson.length - 1].response = [{ "text": document.getElementById("ans" + json[i].ID).innerText }];
                }
            }
        }
        return newJson;
    }

    editor.signals.uploadJson.add(function () {
        var newj = updateJson();
        var pn = document.getElementById('project_field').value;
        $.ajax({
            data: { "projectNum": pn, "tekjson": JSON.stringify(newj) },
            method: 'POST',
            url: 'http://austinteets.com/jsonsave.php',
            dataType: 'text',
            success: function (data) {
                $("#submitProject").html("Submitted!");
                $("#submitProject").attr("disabled", "disabled");
            }
        });
    });

    editor.signals.questionAnswered.add(function (ans) {
        var quest = ans.split(".")[0];
        if (choices[quest]) {
            choices[quest].style.display = 'none';
        }
        qs.lineList[ans].style.display = 'block';
        choices[quest] = qs.lineList[ans];
        Object.keys(qs.dependencies).forEach(function (ky) {
            if (ky.split(".")[0] === quest && ky !== ans) {
                qs.dependencies[ky].forEach(function (hd) {
                    hd.style.display = 'none';
                    var did = hd.getAttribute('id').substring(1);
                    choices[did] ? choices[did].style.display = 'none' : null;
                    var sht = document.getElementById("que" + did);
                    sht ? sht.style.display = 'none' : null;
                });
            }
        });
        if (qs.dependencies[ans]) {
            qs.dependencies[ans].forEach(function (cont) {
                cont.style.display = 'block';
                var did = cont.getAttribute('id').substring(1);
                choices[did] ? choices[did].style.display = 'block' : null;
                var sht = document.getElementById("que" + did);
                var sha = document.getElementById("ans" + did);
                sht && sha.innerText ? sht.style.display = 'block' : null;
            });
        }
        updateJson();
    });

    var groups = qs.groupings;
    editor.signals.groupChanged.add(function (grp) {
        $(".questionBox").hide();
        $(groups[grp]).show();
    });

    var qright = document.createElement("div");
    qright.className = 'testItenerary';

    qright.appendChild(qs.lineSheet);

    var lines = document.createElement("button");
    lines.innerHTML = "Verify";
    lines.className = "submitButton";
    qright.appendChild(lines);

    container.dom.appendChild(qright);

    return [container, qs.radios];
}

function makeQuestionPage(json, editor) {
    var depends = {};
    var lineItems = {};
    var parents = {};

    var grouped = document.createElement("div");
    grouped.className = 'questionGroup';

    var headText = document.createElement("h1");
    headText.appendChild(document.createTextNode("The Question Page"));
    grouped.appendChild(headText);

    var headBar = document.createElement("div");
    headBar.className = 'progBar';
    grouped.appendChild(headBar);

    var hiderest = false;

    var qright = document.createElement("div");
    qright.className = "innerItenerary";

    var numrad = 0;
    for (var i = 0; i < json.length; i++) {
        var container = document.createElement("div");
        container.className = "widget";
        container.id = 'q' + json[i].ID;
        container.appendChild(makeQuestion(json[i], numrad));
        json[i].response.forEach(function (resp) {
            var rp = document.createElement("div");
            rp.className = 'itenerary';
            rp.appendChild(document.createTextNode(json[i].text + ": " + resp.text));
            rp.style.display = 'none';
            lineItems[json[i].ID + "." + resp.ID] = rp;
            qright.appendChild(rp);
        });
        if (json[i].response.length > 0 && !(json[i].text === 'New Product Square Footage' || json[i].text === 'Remove/Haul')) {
            numrad++;
        } else {
            var rp = document.createElement("div");
            rp.className = 'itenerary';
            rp.appendChild(document.createTextNode(json[i].text + ": "));
            var ans = document.createElement("span");
            ans.id = "ans" + json[i].ID;
            rp.id = "que" + json[i].ID; 
            rp.appendChild(ans);
            rp.style.display = 'none';
            qright.appendChild(rp);
        }
        if (json[i].dependencies.length !== 0) {
            container.style.display = 'none';
            json[i].dependencies.forEach(function (dep) {
                depends[dep] = depends[dep] ? depends[dep] : [];
                depends[dep].push(container);
            });
        }
        if (!parents[json[i].group]) {
            var parent = document.createElement("div");
            parent.className = 'questionBox';
            grouped.appendChild(parent);
            parent.style.display = hiderest ? 'none' : 'block';
            parents[json[i].group] = parent;

            var parentName = document.createElement("div");
            parentName.id = json[i].group;
            parentName.className = hiderest ? 'parallelogram' : 'selectedParallelogram';
            parentName.appendChild(document.createTextNode(json[i].group));
            $(parentName).click(function () {
                $(".selectedParallelogram").attr('class', 'parallelogram');
                $(this).attr('class', "selectedParallelogram");
                editor.signals.groupChanged.dispatch(this.id);
            });
            headBar.appendChild(parentName);

            hiderest = true;
        }
        parents[json[i].group].appendChild(container);
    }
    return {"questions" : grouped, "radios" : numrad, "dependencies" : depends, "lineList" : lineItems, "lineSheet" : qright, "groupings" : parents};
}

function makeQuestion(q, index) {
    var inp = document.createElement("div");
    inp.className = 'questionClass';

    var head = document.createElement("div");
    head.className = 'questionLegend';
    head.appendChild(document.createTextNode(q.text));
    inp.appendChild(head);

    var cont = document.createElement("div");
    cont.className = 'questionAnswers';

    if (q.text === 'New Product Square Footage' || q.text === 'Remove/Haul') {
        makeCustomInput(q, index, cont);
        inp.appendChild(cont);
        return inp;
    }

    for (var z = 0; z < q.response.length; z++) {
        var rad = document.createElement("input");
        $(rad).attr('type', "radio");
        rad.id = q.ID + "." + q.response[z].ID;
        rad.name = 'radio-'+index;
        cont.appendChild(rad);

        var radLabel = document.createElement("label");
        radLabel.innerHTML = q.response[z].text;
        radLabel.className = 'radioLabel';
        $(radLabel).attr("for", q.ID + "." + q.response[z].ID);
        cont.appendChild(radLabel);
    }
    if (q.response.length === 0) {
        var shrt = document.createElement("input");
        $(shrt).attr('type', "text");
        shrt.id = q.ID;
        shrt.className = 'questionFill';
        $(shrt).on('change keydown paste input', function () {
            document.getElementById("que" + this.id).style.display = 'block';
            document.getElementById("ans" + this.id).innerText = $(this).val();
        });
        cont.appendChild(shrt);
    }
    inp.appendChild(cont);

    return inp;
}

function makeCustomInput(q, index, cont) {
    for (var z = 0; z < q.response.length; z++) {
        var shrtLabel = document.createElement("div");
        shrtLabel.style.height = '50px';
        var shrtName = document.createElement("span");
        shrtName.style.width = '400px';
        shrtName.style.textAlign = 'left';
        shrtName.style.fontSize = '16px';
        shrtName.appendChild(document.createTextNode(q.response[z].text));
        shrtName.style.marginRight = '20px';
        shrtLabel.appendChild(shrtName);

        shrtLabel.style.width = '600px';
        shrtLabel.style.color = 'black';
        
        var shrt = document.createElement("input");
        shrt.style.width = '100px';
        shrt.style.display = 'inline-block';
        shrt.style.cssFloat = 'right';
        $(shrt).attr('type', "text");
        shrt.id = q.ID;
        shrt.name = q.response[z].text;
        shrt.className = q.ID;
        $(shrt).on('change keydown paste input', function () {
            document.getElementById("que" + this.id).style.display = 'block';
            var x = "";
            $("." + this.id).each(function () {
                if ($(this).val()) {
                    x += $(this).attr('name') + " " + $(this).val() + " sqFt. ";
                }
            });
            document.getElementById("ans" + this.id).innerText = x;
        });
        shrtLabel.appendChild(shrt);
        cont.appendChild(shrtLabel);
    }
}