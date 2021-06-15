import { React, useState, useEffect } from "react";
import axios from "axios";

import SingleUserForm from "../components/formdata/SingleUserForm";
import DoughnutChart from "../components/DoughnutChart";
import RatingGraph from "../components/RatingGraph";
const request = require("request");
const cheerio = require("cheerio");

function SingleUser() {
  const [stats, setStats] = useState([]);
  const [user, Setuser] = useState(null);
  const [DATE, setDATE] = useState([]);
  const [rating, Setrating] = useState([]);
  const [bestrank,SetBestrank]=useState([]);
  const [worstrank,Setworstrank]=useState([]);
  const [MaxUp,setmaxup]=useState([]);
  const [Maxdown,setMaxdown]=useState([]);
  const [contests,Setcontests]=useState([]);
  function loader(enteredUsername) {
    setStats([]);
    Setuser(enteredUsername);
  }
  function getRatingData(UserName) {
    var ratings = [],
      ranks=[],
      dates = [];   
      var Best=[];
      var Worst=[];
      var maxup=[];
      var maxdown=[];
    request(
      "https://aqueous-ravine-73981.herokuapp.com/https://www.codechef.com/users/" +
        UserName,
      (error, response, html) => {
        if (!error && response.statusCode === 200) {
          var $ = cheerio.load(html);
          var Str = $("body");
          Str = Str.html();
          Str = Str.toString();
          let index = Str.indexOf("all_rating");
          Str = Str.slice(index);
          let index1 = Str.indexOf("[{");
          index = Str.indexOf("}]");
          var S = Str.slice(index1, index + 2);
          var req = JSON.parse(S);
          var best,worst,maxUp,maxDown;
          for (var i = 0; i < req.length; i++) {
            ratings.push(parseInt(req[i].rating));
            dates.push(req[i].name);
            ranks.push(parseInt(req[i].rank));
            if(i===0){
              best=req[i].rank;
              worst=req[i].rank;
              maxUp=0;maxDown=0;
            }
            else{
              best=Math.min(best,ranks[i]);
              worst=Math.max(worst,ranks[i]);
             maxUp=Math.max(maxUp,ratings[i]-ratings[i-1]);
            maxDown=Math.max(maxDown,ratings[i-1]-ratings[i]);
            }
          }
          Best.push(best);
          Worst.push(worst);
          maxup.push(maxUp);
         maxdown.push(maxDown);
         Setcontests([req.length]);
          setmaxup(maxup);
          setMaxdown(maxdown);
          SetBestrank(Best);
          Setworstrank(Worst);
          Setrating(ratings);
          setDATE(dates);

        }
      }
    );
    return [ratings, dates,Best,Worst];
  }
  useEffect(() => {
    var headers = {
      Accept: "application/json",
      Authorization: "Bearer 084dd281796f46eea25c6635c82ca252b45a66c6",
    };
    var UserName = user;
    const url =
      "https://api.codechef.com/users/" +
      UserName +
      "?fields=username%2C%20fullname%2C%20country%2C%20state%2C%20city%2C%20rankings%2C%20ratings%2C%20occupation%2C%20language%2C%20organization%2C%20problemStats%2C%20submissionStats";
    axios
      .get(url, { headers: headers })
      .then((res) => res)
      .then(
        (res) => {
          if (res.data.result.data.code === 9001) {
            var sol = [];
            sol.push(
              res.data.result.data.content.submissionStats.acceptedSubmissions
            );
            sol.push(
              res.data.result.data.content.submissionStats.wrongSubmissions
            );
            sol.push(
              res.data.result.data.content.submissionStats.timeLimitExceed
            );
            sol.push(res.data.result.data.content.submissionStats.runTimeError);
            sol.push(
              res.data.result.data.content.submissionStats.compilationError
            );
            sol.push(
              res.data.result.data.content.submissionStats
                .partiallySolvedProblems
            );
            setStats(sol);
          } else {
            setStats([]);
            alert("Enter correct Codechef username");
            Setuser(null);
          }
        },
        (error) => {
          console.log(error);
        }
    );
    var x, y, a, b;
    [x, y, a, b] = getRatingData(user);
    console.log(x, y,a ,b);
    console.log(user);
  }, [user]);

  return (
    <>
      <SingleUserForm OnSubmit={loader} />
      {user ? (
        <> 
          <div>Bestrank={bestrank}</div>
           <div>Worstrank={worstrank}</div>
           <div>MaxUp={MaxUp}</div>
           <div>Maxdown={Maxdown}</div>
          <div>Total Contests={contests}</div>
          <div>
            <DoughnutChart data={stats} />
          </div>
          <div>
            <RatingGraph date={DATE} Rating={rating} />
          </div>
        </>
      ) : (
        <> </>
      )}
    </>
  );
}

export default SingleUser;
