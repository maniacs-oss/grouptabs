define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-class",
	"./_Scene",
	"dijit/registry",
	"dijit/form/ValidationTextBox",
	"dijit/form/DateTextBox",
	"../widgets/ParticipantInput",
	"../widgets/NewParticipantInput",
	"dojo/text!./templates/EditEntry.html"
], function(declare, lang, array, domClass, _Scene, dijitRegistry, ValidationTextBox, DateTextBox, ParticipantFormWidget, NewParticipantFormWidget, template){

return declare(_Scene, {
	
	templateString: template,
	
	name: "editEntry",
	
	constructor: function(){
		this._participantFormWidgets = []
	},

	onShow: function(entryId){
		if(entryId !== undefined){
			var data = this.app.store.get(entryId)
			this._createParticipantFormWidgets(data)
			this._prefill(data)
			this._editEntry = entryId
			this._showDeleteButton()
			this.headingNode.innerHTML = "Edit transaction"
		}else{
			this._createParticipantFormWidgets()
			if(!this._participantFormWidgets.length){
				this._createNewParticipantFormWidget()
				this._createNewParticipantFormWidget()
			}
			if(this._participantFormWidgets.length < 3){
				this.selectAllButton.domNode.style.display = "none"
			}
			this._hideDeleteButton()
			this.headingNode.innerHTML = "New transaction"
		}
	},

	_prefill: function(data){
		dijitRegistry.byId("editEntryTitle").set("value", data.title)
		dijitRegistry.byId("editEntryDate").set("value", new Date(data.date))
	},
	
	_createParticipantFormWidgets: function(data){
		var accounts = this.app.getAccounts()
		var accountCount = (function(){
			var count = 0
			for(var key in accounts){
				count++
			}
			return count
		})()
		var isChecked = !data && accountCount == 2
		for(var account in accounts){
			this._createParticipantFormWidget(account, data, isChecked)
		}
	},

	_createParticipantFormWidget: function(participant, data, isChecked){
		var widgetParams = {
			name: "participants",
			participant: participant
		}
		if(data){
			data.payments.forEach(function(payment){
				if(payment.participant == participant){
					widgetParams.amount = payment.amount
				}
			})
		}
		var widget = new ParticipantFormWidget(widgetParams)
		if(isChecked || data && data.participants.indexOf(participant) !== -1){
			widget.joinedButton.set("checked", true)
			if(widgetParams.amount){
				widget.paidButton.set("checked", true)
			}
		}
		widget.placeAt(this.participantsNode)
		this._participantFormWidgets.push(widget)
		setTimeout(function(){
			widget.set("ready", true)
		}, 100)
	},

	_removeParticipantFormWidgets: function(){
		this._participantFormWidgets.forEach(function(widget){
			widget.destroy()
		}, this)
		this._participantFormWidgets = []
	},

	_onNewParticipantClick: function(){
		this._createNewParticipantFormWidget()
		var widget = this._participantFormWidgets[this._participantFormWidgets.length - 1]
		widget.joinedButton.set("checked", true)
		widget.set("focus", true)
	},

	_createNewParticipantFormWidget: function(){
		var widget = new NewParticipantFormWidget({name: "participants"})
		this.connect(widget, "onRemove", this._removeNewParticipantFormWidget)
		widget.placeAt(this.participantsNode)
		this._participantFormWidgets.push(widget)
		setTimeout(function(){
			widget.set("ready", true)
		}, 100)
	},

	_removeNewParticipantFormWidget: function(widget){
		this._participantFormWidgets.forEach(function(_widget){
			if(_widget == widget){
				widget.destroy()
			}
		})
	},

	_onAllClick: function(){
		this._participantFormWidgets.forEach(function(widget){
			widget.set("selected", true)
		})
	},

	_onOkClick: function(){
		this._saveEntry()
		if(this._editEntry !== undefined){
			this.app.deleteEntry(this._editEntry)
		}
		this.reset()
		this.close(this, this.app.homeView)
	},

	_onDeleteClick: function(){
		this.app.deleteEntry(this._editEntry)
		this.reset()
		this.close(this, "list")
	},
	
	_onCancelClick: function(){
		this.reset()
		this.close(this, this.app.homeView)
	},
	
	_saveEntry: function(){
		var data = this.get("value")
		var participants = array.filter(data.participants, function(participant){
			return participant.participant
		})
		participants = array.map(participants, function(participant){
			return participant.participant
		})
		var payments = array.filter(data.participants, function(participant){
			return participant.participant && participant.amount
		})
		payments = array.map(payments, function(participant){
			return {participant: participant.participant, amount: participant.amount}
		})
		this.app.saveEntry({
			id: "" + new Date().getTime(),
			box: this.app.tab,
			type: "spending",
			title: data.title,
			date: data.date.getTime(),
			participants: participants,
			payments: payments
		})
	},

	_showDeleteButton: function(){
		this.deleteButton.domNode.style.display = ""
		domClass.remove(this.saveButton.domNode, "full-width-margin")
		domClass.add(this.buttonRowNode, "button-row")
	},

	_hideDeleteButton: function(){
		this.deleteButton.domNode.style.display = "none"
		domClass.add(this.saveButton.domNode, "full-width-margin")
		domClass.remove(this.buttonRowNode, "button-row")
	},
	
	reset: function(){
		this.inherited(arguments)
		delete this._editEntry
		this._hideDeleteButton()
		this.selectAllButton.domNode.style.display = ""
		this._removeParticipantFormWidgets()
	}

})

})