/*
 * A utility class that allows elements to be hidden or shown based on form 
 * input.  This is accomplished through the use of special CSS class names.
 */
function ToggleFormContent() {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    /* Handy alias */
    var self = this;

    /* Instance variables */
    self.effectDuration = 0;

    /*
    * Get the set class string from CSS class if a given element.  The Last 
    * class matching /set-(.+)/ is returned.
    */
    self.getSetClass = function($el) {
        var classes = $el.attr("class").split(" ");
        var setClass = null;
        for (i = 0; i < classes.length; i++) {
            if (classes[i].match(/set-(.+)/)) {
                setClass = classes[i];
            }
        }
        return setClass;
    };

    /*
    * Determine whether or not a given input is "selected".  If input is not
    * checkbox or radio buttons, this method always returns true.
    */
    self.selected = function($inputEl) {
        var type = $inputEl.attr("type");
        var selected = false;
        if (type == "checkbox" || type == "radio") {
            selected = $inputEl.prop("checked");
        } else {
            selected = true;
        }
        return selected;
    };

    /*
    * Toggle target visibility for checkbox input triggers.
    */
    self.toggleCheckboxTarget = function($trigger) {
        var checkboxName = $trigger.attr("name");
		var setClass = self.getSetClass($trigger);
        $trigger.parents(".checkbox-group, .checkbox").find("[name='" + checkboxName + "']").each(function() {
            var $checkbox = jQuery(this);
            var $target = jQuery(".tfc-target." + $checkbox.val() + "." + setClass).parents("div.section");
            if ($checkbox.is(":checked")) {
                self.show($target);
            } else {
                self.hide($target);
            }
        });
    };

    /*
    * Toggle target visibility for non-checkbox input triggers.
    */
    self.toggleTarget = function($trigger) {
        var setClass = self.getSetClass($trigger);
        // Show matching element, if trigger input selected and value not an empty string
        if (self.selected($trigger) && $trigger.val() != "") {
        	self.hide(jQuery(".tfc-target." + setClass).parents("div.section")); // hide all in set
            self.show(jQuery(".tfc-target." + $trigger.val() + "." + setClass).parents("div.section")); // show one with trigger value as class in set
        }
    };

    /*
    * Hide an element with the appropriate effect
    */
    self.hide = function($el, duration) {
        if (duration == undefined) {
            duration = self.effectDuration;
        }
        $el.hide();
    };

    /*
    * Show an element with the appropriate effect
    */
    self.show = function($el, duration) {
        if (duration == undefined) {
            duration = self.effectDuration;
        }
        $el.show();
    };

    /*
    * Setup toggle form content functionality.
    */
    self.init = function() {
        // Hide all target components
        self.hide(jQuery(".tfc-target").parents("div.section"), 0);
        jQuery("input.tfc-trigger, select.tfc-trigger").change(function() {
            var $trigger = jQuery(this);
            var setClass = self.getSetClass($trigger);
            if (setClass != null) {
                if ($trigger.attr("type") == "checkbox") {
                    self.toggleCheckboxTarget($trigger);
                } else {
                    self.toggleTarget($trigger);
                }
            } else if (setClass == null) {
                throw "Cannot find a toggle form content set class on trigger.";
            }
        }).change();
    };
    
    self.init();
}

jQuery(document).ready(function() {
	ToggleFormContent();
});