# import re
# class clean_prompt:
# 	def cleanpro(self,stp):
# 		p=r'([A-Za-z]+[\d@]+[\w@]*|[\d@]+[A-Za-z]+[\w@]*)'
# 		pa1=r"code is: ([A-Za-z0-9@#$!]+)"
# 		pa2=r"password is: ([A-Za-z0-9@#$!]+)"
# 		pa3=r"secret code is ([A-Za-z0-9@#$!]+)"
# 		pa4=r"code ([A-Za-z0-9@#$!]+)"
# 		pa5=r"password ([A-Za-z0-9@#$!]+)"
# 		pa6=r"username ([A-Za-z0-9@#$!]+)"
# 		pa7=r"my name is ([A-Za-z0-9@#$!]+)"
# 		pa8=r"my Name ([A-Za-z0-9@#$!]+)"
# 		pa9=r"my name ([A-Za-z0-9@#$!]+)"
# 		pa10=r"My name ([A-Za-z0-9@#$!]+)"
# 		pa11=r"Name is ([A-Za-z0-9@#$!]+)"
# 		pa12=r"name is ([A-Za-z0-9@#$!]+)"
# 		pa13=r"my key ([A-Za-z0-9@#$!]+)"
#     	pa14=r"pass ([A-Za-z0-9@#$!]+)"
# 		pa15=r"pass is ([A-Za-z0-9@#$!]+)"
# 		pa16=r"key is ([A-Za-z0-9@#$!]+)"
# 		pa17=r"key ([A-Za-z0-9@#$!]+)"
# 		nst=[]
# 		for i in stp.split():
#     			if((i not in re.findall(p4,stp))and(i not in re.findall(pa1,stp))and(i not in re.findall(pa2,stp))and(i not in re.findall(pa3,stp))and(i not in re.findall(pa4,stp))and(i not in re.findall(pa5,stp))and(i not in re.findall(pa6,stp))and(i not in re.findall(pa7,stp))and(i not in re.findall(pa8,stp))and(i not in re.findall(pa9,stp))and(i not in re.findall(pa10,stp))and(i not in re.findall(pa11,stp))and(i not in re.findall(pa12,stp))and(i not in re.findall(pa13,stp))and(i not in re.findall(pa14,stp))and(i not in re.findall(pa15,stp))and(i not in re.findall(pa16,stp))and(i not in re.findall(pa17,stp))):
#            			nst.append(i)
# 		st=" ".join(nst)
# 		return st




