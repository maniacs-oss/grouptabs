define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"dojo/number",
	"./_Scene",
	"dojo/text!./templates/Main.html"
], function(declare, domConstruct, number, _Scene, template){

return declare(_Scene, {
	
	templateString: template,
	
	name: "main",
	
	postCreate: function(){
		this._renderSummary()
	},
	
	_onChangeTabClick: function(){
		this.close(this, "tabs")
	},
	
	_onNewEntryClick: function(){
		this.close(this, "editEntry")
	},
	
	_onSummaryClick: function(){
		this.close(this, "summary")
	},
	
	_onListClick: function(){
		this.close(this, "list")
	},
	
	onShow: function(){
		this.refresh()
		this.app.setHomeView("main")
	},

	refresh: function(){
		this.tabNameNode.innerHTML = this.app.tab
		this.refreshSummary()
		this._checkEmpty()
	},
	
	refreshSummary: function(){
		this._clearSummary()
		this._renderSummary()
	},

	_checkEmpty: function(){
		var transactions = this.app.store.query({box: this.app.tab})
		if(transactions.length){
			this.contentNode.style.display = ''
			this.emptyNode.style.display = 'none'
		}else{
			this.contentNode.style.display = 'none'
			this.emptyNode.style.display = ''
		}
	},

	_renderSummary: function(){
		var accounts = (function(accountsObj){
			var result = []
			for(var accountName in accountsObj){
				var resultObj = {}
				resultObj.account = accountName
				resultObj.amount = accountsObj[accountName]
				result.push(resultObj)
			}
			result.sort(function(a, b){
				return a.amount < b.amount ? -1 : 1
			})
			return result
		})(this.app.getAccounts())
		var maxAmount = (function(){
			var result = 0
			accounts.forEach(function(account){
				var amount = Math.abs(account.amount)
				if(amount > result){
					result = amount
				}
			})
			return Math.round(result * 100) / 100
		})()
		var cssColor = function(amount){
			if(!maxAmount){
				return 'transparent'
			}
			var isNegative = amount < 0
			amount = Math.abs(amount)
			var factor = amount / maxAmount
			var hue = isNegative ? 19 : 98  // red: 360, green: 120
			var saturation = isNegative ? '77%' : '88%'
			var levelFactor = isNegative ? 0.99 : 0.93
			var level = Math.round(100 - factor * 50 * (1 - levelFactor + 1)) + '%'  // 50% is full color
			return "hsl(" + hue + ", " + saturation + ", " + level + ")"
		}
		var html = "<table id='balance'>"
		accounts.forEach(function(accountObj){
			var amount = number.format(accountObj.amount, {places: 2})
			html +=
				"<tr style='background-color: " + cssColor(accountObj.amount) + "'>"
				+ "<th class='account'>" + accountObj.account + "</th>"
				+ "<td class='amount'>" + amount + "</td>"
				+ "</tr>"
		})
		html += "</table>"
		this.summaryNode.appendChild(domConstruct.toDom(html))
	},
	
	_clearSummary: function(){
		domConstruct.empty(this.summaryNode)
	}
})

})